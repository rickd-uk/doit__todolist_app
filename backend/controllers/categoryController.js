const { Category, Todo } = require("../models");

// Generate random color
const generateRandomColor = () => {
  return (
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
  );
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [
        ["order", "ASC"],
        ["createdAt", "ASC"],
      ],
      include: [
        {
          model: Todo,
          as: "todos",
        },
      ],
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [
        {
          model: Todo,
          as: "todos",
          order: [
            ["order", "ASC"],
            ["dateCreated", "DESC"],
          ],
        },
      ],
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create category
exports.createCategory = async (req, res) => {
  try {
    const { emoji, name, description, color } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    // Get the highest order value
    const maxOrder = (await Category.max("order")) || 0;

    const category = await Category.create({
      emoji: emoji || "📌",
      name,
      description: description || null,
      color: color || generateRandomColor(),
      order: maxOrder + 1,
    });

    res.status(201).json(category);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Category name already exists" });
    }
    res.status(500).json({ error: error.message });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { emoji, name, description, color } = req.body;
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    await category.update({
      emoji: emoji !== undefined ? emoji : category.emoji,
      name: name !== undefined ? name : category.name,
      description:
        description !== undefined ? description : category.description,
      color: color !== undefined ? color : category.color,
    });

    res.json(category);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Category name already exists" });
    }
    res.status(500).json({ error: error.message });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Set all todos in this category to null (unspecified)
    await Todo.update(
      { categoryId: null },
      { where: { categoryId: req.params.id } },
    );

    await category.destroy();
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reorder categories
exports.reorderCategories = async (req, res) => {
  try {
    const { categories } = req.body; // Array of {id, order}

    if (!Array.isArray(categories)) {
      return res.status(400).json({ error: "Categories must be an array" });
    }

    // Update each category's order
    await Promise.all(
      categories.map((cat) =>
        Category.update({ order: cat.order }, { where: { id: cat.id } }),
      ),
    );

    res.json({ message: "Categories reordered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
