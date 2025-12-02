const Category = require("./Category");
const Todo = require("./Todo");
const User = require("./User");

// User associations
User.hasMany(Category, {
  foreignKey: "userId",
  as: "categories",
  onDelete: "CASCADE",
});

User.hasMany(Todo, {
  foreignKey: "userId",
  as: "todos",
  onDelete: "CASCADE",
});

// Category associations
Category.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Category.hasMany(Todo, {
  foreignKey: "categoryId",
  as: "todos",
});

// Todo associations
Todo.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Todo.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "category",
});

module.exports = {
  Category,
  Todo,
  User,
};
