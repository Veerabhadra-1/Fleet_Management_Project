const mongoose = require("mongoose");

const fuelLogSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
  liters: { type: Number, required: true },
  cost: { type: Number, required: true },
  date: { type: Date, required: true, default: Date.now },
  odometerAtFill: { type: Number, default: null },
}, { timestamps: true });

const FuelLog = mongoose.model("FuelLog", fuelLogSchema);
module.exports = FuelLog;
