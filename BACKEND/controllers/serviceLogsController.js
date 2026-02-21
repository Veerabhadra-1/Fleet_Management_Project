const ServiceLog = require("../models/ServiceLog");
const Vehicle = require("../models/Vehicle");

const list = async (req, res) => {
  try {
    const { vehicleId } = req.query;
    const filter = {};
    if (vehicleId) filter.vehicleId = vehicleId;
    const logs = await ServiceLog.find(filter).populate("vehicleId", "name licensePlate status").sort({ date: -1 });
    return res.status(200).json(logs);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const log = await ServiceLog.findById(req.params.id).populate("vehicleId");
    if (!log) return res.status(404).json({ message: "Service log not found." });
    return res.status(200).json(log);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { vehicleId, serviceType, cost, date, notes } = req.body;
    if (!vehicleId || !serviceType || cost == null) {
      return res.status(400).json({ message: "vehicleId, serviceType, and cost are required." });
    }
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found." });
    const log = new ServiceLog({
      vehicleId,
      serviceType,
      cost: Number(cost),
      date: date ? new Date(date) : new Date(),
      notes: notes || "",
    });
    await log.save();
    await Vehicle.findByIdAndUpdate(vehicleId, { status: "In Shop" });
    const populated = await ServiceLog.findById(log._id).populate("vehicleId");
    return res.status(201).json(populated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const log = await ServiceLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: "Service log not found." });
    const { serviceType, cost, date, notes } = req.body;
    if (serviceType !== undefined) log.serviceType = serviceType;
    if (cost != null) log.cost = Number(cost);
    if (date !== undefined) log.date = new Date(date);
    if (notes !== undefined) log.notes = notes;
    await log.save();
    const updated = await ServiceLog.findById(log._id).populate("vehicleId");
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const log = await ServiceLog.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ message: "Service log not found." });
    return res.status(200).json({ message: "Service log deleted." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { list, getOne, create, update, remove };
