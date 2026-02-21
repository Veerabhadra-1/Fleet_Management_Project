const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { JWT_SECRET } = require("../middleware/auth");

const JWT_EXPIRES = "7d";

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    const userResponse = await User.findById(user._id).select("-password");
    return res.status(200).json({
      token,
      user: userResponse,
      expiresIn: JWT_EXPIRES,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Login failed." });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(200).json({ message: "If an account exists, a reset link has been sent." });
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;
    if (process.env.NODE_ENV !== "test" && process.env.SMTP_HOST) {
      try {
        const nodemailer = require("nodemailer");
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT || 587,
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        await transporter.sendMail({
          from: process.env.SMTP_FROM || "noreply@fleetflow.com",
          to: user.email,
          subject: "FleetFlow – Password Reset",
          text: `Use this link to reset your password (valid 1 hour): ${resetUrl}`,
          html: `<p>Use this link to reset your password (valid 1 hour): <a href="${resetUrl}">${resetUrl}</a></p>`,
        });
      } catch (mailErr) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return res.status(500).json({ message: "Failed to send reset email." });
      }
    }
    return res.status(200).json({
      message: "If an account exists, a reset link has been sent.",
      resetToken: process.env.NODE_ENV === "development" ? resetToken : undefined,
      resetUrl: process.env.NODE_ENV === "development" ? resetUrl : undefined,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Request failed." });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Valid token and password (min 6 chars) are required." });
    }
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return res.status(200).json({ message: "Password reset successful. You can log in now." });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Reset failed." });
  }
};

const me = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { login, forgotPassword, resetPassword, me };
