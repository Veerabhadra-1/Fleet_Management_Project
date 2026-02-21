const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

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

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehiclesRoutes);
app.use("/api/drivers", driversRoutes);
app.use("/api/trips", tripsRoutes);
app.use("/api/service-logs", serviceLogsRoutes);
app.use("/api/fuel-logs", fuelLogsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/deliverVehicle", deliverVehiclesRouter);

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}`);
});
