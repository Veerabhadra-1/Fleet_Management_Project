const express = require("express");
const { login, forgotPassword, resetPassword, me } = require("../controllers/authController");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", auth, me);

module.exports = router;
