const { Todo, Category } = require("../models");

// Get all todos for the authenticated user
exports.getAllTodos = async (req, res) => {
  try {
    const todos = await Todo.findAll({
      where: { userId: req.userId },
      order: [
        ["order", "ASC"],
        ["dateCreated", "DESC"],
      ],
      include: [
        {
          model: Category,
          as: "category",
        },
      ],
    });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get todos by category (user-scoped)
exports.getTodosByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const where =
      categoryId === "unspecified"
        ? { categoryId: null, userId: req.userId }
        : { categoryId, userId: req.userId };

    const todos = await Todo.findAll({
      where,
      order: [
        ["order", "ASC"],
        ["dateCreated", "DESC"],
      ],
      include: [
        {
          model: Category,
          as: "category",
        },
      ],
    });

    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get todo by ID (user-scoped)
exports.getTodoById = async (req, res) => {
  try {
    const todo = await Todo.findOne({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
      include: [
        {
          model: Category,
          as: "category",
        },
      ],
    });

    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create todo
exports.createTodo = async (req, res) => {
  try {
    const { title, description, categoryId, dateToComplete } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    // Validate category exists and belongs to user if provided
    if (categoryId) {
      const category = await Category.findOne({
        where: {
          id: categoryId,
          userId: req.userId,
        },
      });
      if (!category) {
        return res.status(400).json({ error: "Invalid category" });
      }
    }

    // Get the highest order value for this category and user
    const where = categoryId
      ? { categoryId, userId: req.userId }
      : { categoryId: null, userId: req.userId };
    const maxOrder = (await Todo.max("order", { where })) || 0;

    const todo = await Todo.create({
      userId: req.userId,
      title,
      description: description || null,
      categoryId: categoryId || null,
      dateToComplete: dateToComplete || null,
      dateCreated: new Date(),
      order: 0, // New todos always go to top
    });

    // Shift all other todos down
    await Todo.increment("order", {
      where: {
        id: { [require("sequelize").Op.ne]: todo.id },
        userId: req.userId,
        ...(categoryId ? { categoryId } : { categoryId: null }),
      },
    });

    // Fetch the complete todo with category
    const completeTodo = await Todo.findByPk(todo.id, {
      include: [
        {
          model: Category,
          as: "category",
        },
      ],
    });

    res.status(201).json(completeTodo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update todo
exports.updateTodo = async (req, res) => {
  try {
    const { title, description, categoryId, dateToComplete, completed } =
      req.body;
    const todo = await Todo.findOne({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    // Validate category exists and belongs to user if provided
    if (categoryId) {
      const category = await Category.findOne({
        where: {
          id: categoryId,
          userId: req.userId,
        },
      });
      if (!category) {
        return res.status(400).json({ error: "Invalid category" });
      }
    }

    await todo.update({
      title: title !== undefined ? title : todo.title,
      description: description !== undefined ? description : todo.description,
      categoryId:
        categoryId !== undefined ? categoryId || null : todo.categoryId,
      dateToComplete:
        dateToComplete !== undefined
          ? dateToComplete || null
          : todo.dateToComplete,
      completed: completed !== undefined ? completed : todo.completed,
    });

    // Fetch the complete todo with category
    const completeTodo = await Todo.findByPk(todo.id, {
      include: [
        {
          model: Category,
          as: "category",
        },
      ],
    });

    res.json(completeTodo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete todo
exports.deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    await todo.destroy();
    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reorder todos
exports.reorderTodos = async (req, res) => {
  try {
    const { todos } = req.body;

    if (!Array.isArray(todos)) {
      return res.status(400).json({ error: "Todos must be an array" });
    }

    // Verify all todos belong to the user
    const todoIds = todos.map((t) => t.id);
    const userTodos = await Todo.findAll({
      where: {
        id: todoIds,
        userId: req.userId,
      },
    });

    if (userTodos.length !== todoIds.length) {
      return res.status(403).json({ error: "Unauthorized todo access" });
    }

    // Update each todo's order and category if changed
    await Promise.all(
      todos.map((todo) =>
        Todo.update(
          {
            order: todo.order,
            categoryId: todo.categoryId || null,
          },
          {
            where: {
              id: todo.id,
              userId: req.userId,
            },
          },
        ),
      ),
    );

    res.json({ message: "Todos reordered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
