const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);

// Protected routes
router.get("/me", authMiddleware, authController.getCurrentUser);

module.exports = router;
