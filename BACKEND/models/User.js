const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ROLES = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
    select: false,
  },
  role: {
    type: String,
    required: true,
    enum: ROLES,
  },
  name: {
    type: String,
    trim: true,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
module.exports.ROLES = ROLES;
