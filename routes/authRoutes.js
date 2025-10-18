const express = require("express");
const router = express.Router();
const { verifyPhone, login } = require("../controllers/authController");

console.log("✅ authRoutes.js loaded");

router.post("/verify-phone", verifyPhone);
router.post("/login", login);

module.exports = router;
