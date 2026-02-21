const mongoose = require("mongoose");

const TRIP_STATUS = ["Draft", "Dispatched", "Completed", "Cancelled"];

const tripSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", required: true },
  cargoWeight: { type: Number, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  revenue: { type: Number, default: 0 },
  distance: { type: Number, default: 0 }, // km, for analytics
  status: {
    type: String,
    required: true,
    enum: TRIP_STATUS,
    default: "Draft",
  },
  dispatchedAt: Date,
  completedAt: Date,
}, { timestamps: true });

tripSchema.index({ status: 1, vehicleId: 1, driverId: 1 });

const Trip = mongoose.model("Trip", tripSchema);
module.exports = Trip;
module.exports.TRIP_STATUS = TRIP_STATUS;
