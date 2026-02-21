const Driver = require("../models/Driver");
const { DRIVER_STATUS } = require("../models/Driver");
const { VEHICLE_TYPES } = require("../models/Vehicle");

const list = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const drivers = await Driver.find(filter).sort({ name: 1 });
    return res.status(200).json(drivers);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const listAvailableForDispatch = async (req, res) => {
  try {
    const now = new Date();
    const drivers = await Driver.find({
      status: { $in: ["Off Duty"] },
      licenseExpiryDate: { $gt: now },
    }).sort({ name: 1 });
    return res.status(200).json(drivers);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: "Driver not found." });
    return res.status(200).json(driver);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { name, licenseNumber, licenseExpiryDate, allowedVehicleType, status, safetyScore, email, phone } = req.body;
    if (!name || !licenseNumber || !licenseExpiryDate) {
      return res.status(400).json({ message: "name, licenseNumber, and licenseExpiryDate are required." });
    }
    const types = Array.isArray(allowedVehicleType) ? allowedVehicleType : (allowedVehicleType ? [allowedVehicleType] : []);
    const invalid = types.filter((t) => !VEHICLE_TYPES.includes(t));
    if (invalid.length) {
      return res.status(400).json({ message: "Invalid allowedVehicleType. Use: " + VEHICLE_TYPES.join(", ") });
    }
    if (types.length === 0) {
      return res.status(400).json({ message: "At least one allowedVehicleType is required." });
    }
    const driver = new Driver({
      name,
      licenseNumber,
      licenseExpiryDate: new Date(licenseExpiryDate),
      allowedVehicleType: types,
      status: status && DRIVER_STATUS.includes(status) ? status : "Off Duty",
      safetyScore: safetyScore != null ? Number(safetyScore) : 100,
      email: email || "",
      phone: phone || "",
    });
    await driver.save();
    return res.status(201).json(driver);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "License number already in use." });
    return res.status(500).json({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: "Driver not found." });
    const { name, licenseNumber, licenseExpiryDate, allowedVehicleType, status, safetyScore, email, phone } = req.body;
    if (name !== undefined) driver.name = name;
    if (licenseNumber !== undefined) driver.licenseNumber = licenseNumber;
    if (licenseExpiryDate !== undefined) driver.licenseExpiryDate = new Date(licenseExpiryDate);
    if (allowedVehicleType !== undefined) {
      const types = Array.isArray(allowedVehicleType) ? allowedVehicleType : [allowedVehicleType];
      const invalid = types.filter((t) => !VEHICLE_TYPES.includes(t));
      if (invalid.length) return res.status(400).json({ message: "Invalid allowedVehicleType." });
      if (types.length) driver.allowedVehicleType = types;
    }
    if (status !== undefined && DRIVER_STATUS.includes(status)) driver.status = status;
    if (safetyScore != null) driver.safetyScore = Math.min(100, Math.max(0, Number(safetyScore)));
    if (email !== undefined) driver.email = email;
    if (phone !== undefined) driver.phone = phone;
    await driver.save();
    return res.status(200).json(driver);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "License number already in use." });
    return res.status(500).json({ message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) return res.status(404).json({ message: "Driver not found." });
    return res.status(200).json({ message: "Driver deleted." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { list, listAvailableForDispatch, getOne, create, update, remove };
