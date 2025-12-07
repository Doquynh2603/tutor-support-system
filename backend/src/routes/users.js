/**
 * File: users.js
 * Mục đích: Routes cho User APIs
 * ✅ Thêm protect middleware cho /profile endpoint
 */

const express = require("express");
const router = express.Router();
const protect = require("../middlewares/protect");
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

// Profile endpoint - protected nhưng không yêu cầu role cụ thể
router.get("/profile", protect, (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
});

module.exports = router;
