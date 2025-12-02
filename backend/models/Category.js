const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Category = sequelize.define(
  "Category",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    emoji: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "📌",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "#" + Math.floor(Math.random() * 16777215).toString(16),
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "categories",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "name"],
      },
    ],
  },
);

module.exports = Category;
