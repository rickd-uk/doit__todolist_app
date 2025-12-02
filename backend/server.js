require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sequelize = require("./config/database");
const { Category, Todo, User } = require("./models");

const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const todoRoutes = require("./routes/todoRoutes");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN === "*"
        ? true
        : process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes); // Public auth routes

// Protected routes - require authentication
app.use("/api/categories", authMiddleware, categoryRoutes);
app.use("/api/todos", authMiddleware, todoRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Database connection and server start
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Sync models (create tables if they don't exist)
    await sequelize.sync();
    console.log("Database models synchronized.");

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
