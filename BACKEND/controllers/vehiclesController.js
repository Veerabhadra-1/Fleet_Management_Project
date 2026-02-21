const Vehicle = require("../models/Vehicle");
const { VEHICLE_STATUS, VEHICLE_TYPES } = require("../models/Vehicle");

const list = async (req, res) => {
  try {
    const { vehicleType, status, region } = req.query;
    const filter = {};
    if (vehicleType) filter.vehicleType = vehicleType;
    if (status) filter.status = status;
    if (region) filter.region = new RegExp(region, "i");
    const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(vehicles);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const listAvailableForDispatch = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({
      status: "Available",
      _id: { $nin: [] },
    }).sort({ name: 1 });
    return res.status(200).json(vehicles);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found." });
    return res.status(200).json(vehicle);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { name, model, licensePlate, vehicleType, maxLoadCapacity, odometer, status, region, acquisitionCost } = req.body;
    if (!name || !licensePlate || !vehicleType || maxLoadCapacity == null) {
      return res.status(400).json({ message: "name, licensePlate, vehicleType, and maxLoadCapacity are required." });
    }
    if (!VEHICLE_TYPES.includes(vehicleType)) {
      return res.status(400).json({ message: "Invalid vehicleType. Use: " + VEHICLE_TYPES.join(", ") });
    }
    const existing = await Vehicle.findOne({ licensePlate: licensePlate.trim().toUpperCase() });
    if (existing) return res.status(400).json({ message: "License plate already in use." });
    const vehicle = new Vehicle({
      name,
      model: model || "",
      licensePlate: licensePlate.trim().toUpperCase(),
      vehicleType,
      maxLoadCapacity: Number(maxLoadCapacity),
      odometer: Number(odometer) || 0,
      status: status && VEHICLE_STATUS.includes(status) ? status : "Available",
      region: region || "",
      acquisitionCost: Number(acquisitionCost) || 0,
    });
    await vehicle.save();
    return res.status(201).json(vehicle);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "License plate already in use." });
    return res.status(500).json({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found." });
    const { name, model, licensePlate, vehicleType, maxLoadCapacity, odometer, status, region, acquisitionCost, outOfService } = req.body;
    if (name !== undefined) vehicle.name = name;
    if (model !== undefined) vehicle.model = model;
    if (licensePlate !== undefined) {
      const up = licensePlate.trim().toUpperCase();
      if (up !== vehicle.licensePlate) {
        const existing = await Vehicle.findOne({ licensePlate: up });
        if (existing) return res.status(400).json({ message: "License plate already in use." });
        vehicle.licensePlate = up;
      }
    }
    if (vehicleType !== undefined && VEHICLE_TYPES.includes(vehicleType)) vehicle.vehicleType = vehicleType;
    if (maxLoadCapacity != null) vehicle.maxLoadCapacity = Number(maxLoadCapacity);
    if (odometer != null) vehicle.odometer = Number(odometer);
    if (status !== undefined && VEHICLE_STATUS.includes(status)) vehicle.status = status;
    if (region !== undefined) vehicle.region = region;
    if (acquisitionCost != null) vehicle.acquisitionCost = Number(acquisitionCost);
    if (outOfService === true) vehicle.status = "Out of Service";
    if (outOfService === false && vehicle.status === "Out of Service") vehicle.status = "Available";
    await vehicle.save();
    return res.status(200).json(vehicle);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "License plate already in use." });
    return res.status(500).json({ message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found." });
    return res.status(200).json({ message: "Vehicle deleted." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  list,
  listAvailableForDispatch,
  getOne,
  create,
  update,
  remove,
};
