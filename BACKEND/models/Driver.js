const mongoose = require("mongoose");
const { VEHICLE_TYPES } = require("./Vehicle");

const DRIVER_STATUS = ["On Duty", "Off Duty", "Suspended"];

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  licenseExpiryDate: { type: Date, required: true },
  allowedVehicleType: {
    type: [String],
    required: true,
    validate: {
      validator: (v) => Array.isArray(v) && v.length > 0 && v.every((t) => VEHICLE_TYPES.includes(t)),
      message: "Each allowed vehicle type must be one of: " + VEHICLE_TYPES.join(", "),
    },
  },
  status: {
    type: String,
    required: true,
    enum: DRIVER_STATUS,
    default: "Off Duty",
  },
  safetyScore: { type: Number, default: 100, min: 0, max: 100 },
  tripsCompleted: { type: Number, default: 0 },
  email: { type: String, trim: true },
  phone: { type: String, trim: true },
}, { timestamps: true });

driverSchema.index({ status: 1, licenseExpiryDate: 1 });

const Driver = mongoose.model("Driver", driverSchema);
module.exports = Driver;
module.exports.DRIVER_STATUS = DRIVER_STATUS;
