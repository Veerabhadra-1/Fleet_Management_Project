// const dotenv = require("dotenv");
// dotenv.config();

// const express = require("express");
// const cors = require("cors");
// const mongoose = require("mongoose");

// const authRoutes = require("./routes/auth");
// const vehiclesRoutes = require("./routes/vehicles");
// const driversRoutes = require("./routes/drivers");
// const tripsRoutes = require("./routes/trips");
// const serviceLogsRoutes = require("./routes/serviceLogs");
// const fuelLogsRoutes = require("./routes/fuelLogs");
// const dashboardRoutes = require("./routes/dashboard");
// const analyticsRoutes = require("./routes/analytics");
// const deliverVehiclesRouter = require("./routes/deliverVehicles");

// const app = express();

// app.use(cors());
// app.use(express.json());

// app.use("/api/auth", authRoutes);
// app.use("/api/vehicles", vehiclesRoutes);
// app.use("/api/drivers", driversRoutes);
// app.use("/api/trips", tripsRoutes);
// app.use("/api/service-logs", serviceLogsRoutes);
// app.use("/api/fuel-logs", fuelLogsRoutes);
// app.use("/api/dashboard", dashboardRoutes);
// app.use("/api/analytics", analyticsRoutes);
// app.use("/deliverVehicle", deliverVehiclesRouter);

// mongoose
//   .connect(process.env.MONGO_URL, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.log(err));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server is up and running on port ${PORT}`);
// });


require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const authRoutes = require("./routes/auth");
const vehiclesRoutes = require("./routes/vehicles");
const driversRoutes = require("./routes/drivers");
const tripsRoutes = require("./routes/trips");
const serviceLogsRoutes = require("./routes/serviceLogs");
const fuelLogsRoutes = require("./routes/fuelLogs");
const dashboardRoutes = require("./routes/dashboard");
const analyticsRoutes = require("./routes/analytics");
const deliverVehiclesRouter = require("./routes/deliverVehicles");

const app = express();

/* =======================
   CORS Configuration
======================= */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

app.use(express.json());

/* =======================
   API Routes
======================= */
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehiclesRoutes);
app.use("/api/drivers", driversRoutes);
app.use("/api/trips", tripsRoutes);
app.use("/api/service-logs", serviceLogsRoutes);
app.use("/api/fuel-logs", fuelLogsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/deliverVehicle", deliverVehiclesRouter);

/* =======================
   MongoDB Connection
======================= */
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

/* =======================
   Serve Frontend in Production
======================= */
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
  });
}

/* =======================
   Start Server
======================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});