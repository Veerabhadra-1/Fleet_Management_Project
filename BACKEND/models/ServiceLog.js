const mongoose = require("mongoose");

const serviceLogSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
  serviceType: { type: String, required: true },
  cost: { type: Number, required: true },
  date: { type: Date, required: true, default: Date.now },
  notes: { type: String, default: "" },
}, { timestamps: true });

const ServiceLog = mongoose.model("ServiceLog", serviceLogSchema);
module.exports = ServiceLog;
