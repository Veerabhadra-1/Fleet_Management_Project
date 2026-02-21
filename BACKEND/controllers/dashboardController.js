const Vehicle = require("../models/Vehicle");
const Trip = require("../models/Trip");

const getKpis = async (req, res) => {
  try {
    const { vehicleType, status, region } = req.query;
    const filter = {};
    if (vehicleType) filter.vehicleType = vehicleType;
    if (status) filter.status = status;
    if (region) filter.region = new RegExp(region, "i");

    const [allVehicles, onTripCount, inShopCount, draftTrips] = await Promise.all([
      Vehicle.find(filter),
      Vehicle.countDocuments({ ...filter, status: "On Trip" }),
      Vehicle.countDocuments({ ...filter, status: "In Shop" }),
      Trip.countDocuments({ status: "Draft" }),
    ]);

    const total = allVehicles.length;
    const assigned = allVehicles.filter((v) => ["On Trip"].includes(v.status)).length;
    const utilizationRate = total > 0 ? Math.round((assigned / total) * 100) : 0;

    return res.status(200).json({
      activeFleet: onTripCount,
      maintenanceAlerts: inShopCount,
      utilizationRate,
      pendingCargo: draftTrips,
      totalVehicles: total,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getKpis };
