const { Todo, Category } = require('../models');

// Get all todos
exports.getAllTodos = async (req, res) => {
  try {
    const todos = await Todo.findAll({
      order: [['order', 'ASC'], ['dateCreated', 'DESC']],
      include: [{
        model: Category,
        as: 'category'
      }]
    });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get todos by category
exports.getTodosByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    const where = categoryId === 'unspecified' 
      ? { categoryId: null }
      : { categoryId };
    
    const todos = await Todo.findAll({
      where,
      order: [['order', 'ASC'], ['dateCreated', 'DESC']],
      include: [{
        model: Category,
        as: 'category'
      }]
    });
    
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get todo by ID
exports.getTodoById = async (req, res) => {
  try {
    const todo = await Todo.findByPk(req.params.id, {
      include: [{
        model: Category,
        as: 'category'
      }]
    });
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
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
      return res.status(400).json({ error: 'Title is required' });
    }
    
    // Validate category exists if provided
    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({ error: 'Invalid category' });
      }
    }
    
    // Get the highest order value for this category
    const where = categoryId ? { categoryId } : { categoryId: null };
    const maxOrder = await Todo.max('order', { where }) || 0;
    
    const todo = await Todo.create({
      title,
      description: description || null,
      categoryId: categoryId || null,
      dateToComplete: dateToComplete || null,
      dateCreated: new Date(),
      order: 0 // New todos always go to top
    });
    
    // Shift all other todos down
    await Todo.increment('order', {
      where: {
        id: { [require('sequelize').Op.ne]: todo.id },
        ...where
      }
    });
    
    // Fetch the complete todo with category
    const completeTodo = await Todo.findByPk(todo.id, {
      include: [{
        model: Category,
        as: 'category'
      }]
    });
    
    res.status(201).json(completeTodo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update todo
exports.updateTodo = async (req, res) => {
  try {
    const { title, description, categoryId, dateToComplete, completed } = req.body;
    const todo = await Todo.findByPk(req.params.id);
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    // Validate category exists if provided
    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({ error: 'Invalid category' });
      }
    }
    
    await todo.update({
      title: title !== undefined ? title : todo.title,
      description: description !== undefined ? description : todo.description,
      categoryId: categoryId !== undefined ? (categoryId || null) : todo.categoryId,
      dateToComplete: dateToComplete !== undefined ? (dateToComplete || null) : todo.dateToComplete,
      completed: completed !== undefined ? completed : todo.completed
    });
    
    // Fetch the complete todo with category
    const completeTodo = await Todo.findByPk(todo.id, {
      include: [{
        model: Category,
        as: 'category'
      }]
    });
    
    res.json(completeTodo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete todo
exports.deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findByPk(req.params.id);
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    await todo.destroy();
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reorder todos
exports.reorderTodos = async (req, res) => {
  try {
    const { todos } = req.body; // Array of {id, order, categoryId}
    
    if (!Array.isArray(todos)) {
      return res.status(400).json({ error: 'Todos must be an array' });
    }
    
    // Update each todo's order and category if changed
    await Promise.all(
      todos.map(todo => 
        Todo.update(
          { 
            order: todo.order,
            categoryId: todo.categoryId || null
          },
          { where: { id: todo.id } }
        )
      )
    );
    
    res.json({ message: 'Todos reordered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
