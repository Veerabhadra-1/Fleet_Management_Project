const FuelLog = require("../models/FuelLog");
const Vehicle = require("../models/Vehicle");

const list = async (req, res) => {
  try {
    const { vehicleId } = req.query;
    const filter = {};
    if (vehicleId) filter.vehicleId = vehicleId;
    const logs = await FuelLog.find(filter).populate("vehicleId", "name licensePlate").sort({ date: -1 });
    return res.status(200).json(logs);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const log = await FuelLog.findById(req.params.id).populate("vehicleId");
    if (!log) return res.status(404).json({ message: "Fuel log not found." });
    return res.status(200).json(log);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { vehicleId, liters, cost, date, odometerAtFill } = req.body;
    if (!vehicleId || liters == null || cost == null) {
      return res.status(400).json({ message: "vehicleId, liters, and cost are required." });
    }
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found." });
    const log = new FuelLog({
      vehicleId,
      liters: Number(liters),
      cost: Number(cost),
      date: date ? new Date(date) : new Date(),
      odometerAtFill: odometerAtFill != null ? Number(odometerAtFill) : vehicle.odometer,
    });
    await log.save();
    const populated = await FuelLog.findById(log._id).populate("vehicleId");
    return res.status(201).json(populated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const log = await FuelLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: "Fuel log not found." });
    const { liters, cost, date, odometerAtFill } = req.body;
    if (liters != null) log.liters = Number(liters);
    if (cost != null) log.cost = Number(cost);
    if (date !== undefined) log.date = new Date(date);
    if (odometerAtFill != null) log.odometerAtFill = Number(odometerAtFill);
    await log.save();
    const updated = await FuelLog.findById(log._id).populate("vehicleId");
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const log = await FuelLog.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ message: "Fuel log not found." });
    return res.status(200).json({ message: "Fuel log deleted." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { list, getOne, create, update, remove };
