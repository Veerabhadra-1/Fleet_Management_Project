const mongoose = require("mongoose");

const VEHICLE_STATUS = ["Available", "On Trip", "In Shop", "Out of Service"];
const VEHICLE_TYPES = ["Truck", "Van", "Bike"];

const vehicleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  model: { type: String, default: "" },
  licensePlate: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  vehicleType: {
    type: String,
    required: true,
    enum: VEHICLE_TYPES,
  },
  maxLoadCapacity: { type: Number, required: true }, // kg
  odometer: { type: Number, default: 0 },
  status: {
    type: String,
    required: true,
    enum: VEHICLE_STATUS,
    default: "Available",
  },
  region: { type: String, default: "" },
  acquisitionCost: { type: Number, default: 0 },
}, { timestamps: true });

vehicleSchema.index({ status: 1, vehicleType: 1, region: 1 });

const Vehicle = mongoose.model("Vehicle", vehicleSchema);
module.exports = Vehicle;
module.exports.VEHICLE_STATUS = VEHICLE_STATUS;
module.exports.VEHICLE_TYPES = VEHICLE_TYPES;
