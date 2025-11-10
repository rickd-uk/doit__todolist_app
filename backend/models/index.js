const Category = require('./Category');
const Todo = require('./Todo');

// Define associations
Category.hasMany(Todo, {
  foreignKey: 'categoryId',
  as: 'todos'
});

Todo.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category'
});

module.exports = {
  Category,
  Todo
};
