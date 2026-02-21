require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const User = require("../models/User");

const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
  console.error("MONGO_URL not set");
  process.exit(1);
}

async function seed() {
  await mongoose.connect(MONGO_URL);
  const existing = await User.findOne({ email: "admin@fleetflow.com" });
  if (existing) {
    console.log("Admin user already exists.");
    process.exit(0);
    return;
  }
  await User.create({
    email: "admin@fleetflow.com",
    password: "admin123",
    role: "Fleet Manager",
    name: "Fleet Admin",
  });
  console.log("Created admin user: admin@fleetflow.com / admin123");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
