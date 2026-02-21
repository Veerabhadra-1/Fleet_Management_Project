const Trip = require("../models/Trip");
const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");
const { TRIP_STATUS } = require("../models/Trip");

const list = async (req, res) => {
  try {
    const { status, vehicleId, driverId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (vehicleId) filter.vehicleId = vehicleId;
    if (driverId) filter.driverId = driverId;
    const trips = await Trip.find(filter)
      .populate("vehicleId", "name licensePlate vehicleType maxLoadCapacity status")
      .populate("driverId", "name licenseNumber status")
      .sort({ createdAt: -1 });
    return res.status(200).json(trips);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate("vehicleId")
      .populate("driverId");
    if (!trip) return res.status(404).json({ message: "Trip not found." });
    return res.status(200).json(trip);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { vehicleId, driverId, cargoWeight, origin, destination, revenue, distance } = req.body;
    if (!vehicleId || !driverId || cargoWeight == null || !origin || !destination) {
      return res.status(400).json({ message: "vehicleId, driverId, cargoWeight, origin, and destination are required." });
    }
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found." });
    if (["In Shop", "Out of Service"].includes(vehicle.status)) {
      return res.status(400).json({ message: "Vehicle is not available for dispatch (In Shop or Out of Service)." });
    }
    if (vehicle.status === "On Trip") {
      return res.status(400).json({ message: "Vehicle is already on a trip." });
    }
    const driver = await Driver.findById(driverId);
    if (!driver) return res.status(404).json({ message: "Driver not found." });
    if (driver.status === "Suspended") {
      return res.status(400).json({ message: "Driver is suspended and cannot be assigned." });
    }
    if (new Date(driver.licenseExpiryDate) <= new Date()) {
      return res.status(400).json({ message: "Driver license has expired." });
    }
    if (!driver.allowedVehicleType.includes(vehicle.vehicleType)) {
      return res.status(400).json({ message: "Driver is not allowed to drive this vehicle type." });
    }
    if (Number(cargoWeight) > vehicle.maxLoadCapacity) {
      return res.status(400).json({
        message: `Cargo weight (${cargoWeight} kg) exceeds vehicle max load capacity (${vehicle.maxLoadCapacity} kg).`,
      });
    }
    const trip = new Trip({
      vehicleId,
      driverId,
      cargoWeight: Number(cargoWeight),
      origin,
      destination,
      revenue: Number(revenue) || 0,
      distance: Number(distance) || 0,
      status: "Draft",
    });
    await trip.save();
    const populated = await Trip.findById(trip._id).populate("vehicleId").populate("driverId");
    return res.status(201).json(populated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate("vehicleId").populate("driverId");
    if (!trip) return res.status(404).json({ message: "Trip not found." });
    const { status } = req.body;
    if (!status || !TRIP_STATUS.includes(status)) {
      return res.status(400).json({ message: "Valid status required: " + TRIP_STATUS.join(", ") });
    }
    const prev = trip.status;
    trip.status = status;
    if (status === "Dispatched") {
      trip.dispatchedAt = new Date();
      await Vehicle.findByIdAndUpdate(trip.vehicleId._id, { status: "On Trip" });
      await Driver.findByIdAndUpdate(trip.driverId._id, { status: "On Duty" });
    } else if (status === "Completed") {
      trip.completedAt = new Date();
      await Vehicle.findByIdAndUpdate(trip.vehicleId._id, { status: "Available" });
      await Driver.findByIdAndUpdate(trip.driverId._id, {
        status: "Off Duty",
        $inc: { tripsCompleted: 1 },
      });
    } else if (status === "Cancelled" && (prev === "Dispatched" || prev === "Draft")) {
      if (prev === "Dispatched") {
        await Vehicle.findByIdAndUpdate(trip.vehicleId._id, { status: "Available" });
        await Driver.findByIdAndUpdate(trip.driverId._id, { status: "Off Duty" });
      }
    }
    await trip.save();
    const updated = await Trip.findById(trip._id).populate("vehicleId").populate("driverId");
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate("vehicleId").populate("driverId");
    if (!trip) return res.status(404).json({ message: "Trip not found." });
    if (trip.status !== "Draft") {
      return res.status(400).json({ message: "Only draft trips can be edited." });
    }
    const { vehicleId, driverId, cargoWeight, origin, destination, revenue, distance } = req.body;
    let vehicle = trip.vehicleId;
    if (vehicleId && vehicleId !== trip.vehicleId._id.toString()) {
      vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) return res.status(404).json({ message: "Vehicle not found." });
    }
    let driver = trip.driverId;
    if (driverId && driverId !== trip.driverId._id.toString()) {
      driver = await Driver.findById(driverId);
      if (!driver) return res.status(404).json({ message: "Driver not found." });
    }
    const weight = cargoWeight != null ? Number(cargoWeight) : trip.cargoWeight;
    if (weight > vehicle.maxLoadCapacity) {
      return res.status(400).json({
        message: `Cargo weight (${weight} kg) exceeds vehicle max load capacity (${vehicle.maxLoadCapacity} kg).`,
      });
    }
    if (vehicleId !== undefined) trip.vehicleId = vehicleId;
    if (driverId !== undefined) trip.driverId = driverId;
    if (cargoWeight != null) trip.cargoWeight = weight;
    if (origin !== undefined) trip.origin = origin;
    if (destination !== undefined) trip.destination = destination;
    if (revenue != null) trip.revenue = Number(revenue);
    if (distance != null) trip.distance = Number(distance);
    await trip.save();
    const updated = await Trip.findById(trip._id).populate("vehicleId").populate("driverId");
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found." });
    if (trip.status === "Dispatched") {
      return res.status(400).json({ message: "Cannot delete a dispatched trip. Cancel it first." });
    }
    await Trip.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Trip deleted." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { list, getOne, create, update, updateStatus, remove };
