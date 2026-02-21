const Vehicle = require("../models/Vehicle");
const Trip = require("../models/Trip");
const ServiceLog = require("../models/ServiceLog");
const FuelLog = require("../models/FuelLog");

const aggregateCosts = async (vehicleId) => {
  const [fuelLogs, serviceLogs] = await Promise.all([
    FuelLog.find({ vehicleId }),
    ServiceLog.find({ vehicleId }),
  ]);
  const totalFuelCost = fuelLogs.reduce((s, l) => s + (l.cost || 0), 0);
  const totalMaintenanceCost = serviceLogs.reduce((s, l) => s + (l.cost || 0), 0);
  return { totalFuelCost, totalMaintenanceCost, totalOperationalCost: totalFuelCost + totalMaintenanceCost };
};

const fuelEfficiency = async (req, res) => {
  try {
    const { vehicleId } = req.query;
    const match = vehicleId ? { vehicleId } : {};
    const fuelLogs = await FuelLog.find(match).populate("vehicleId", "name licensePlate");
    const vehicles = await Vehicle.find(vehicleId ? { _id: vehicleId } : {});
    const results = [];
    for (const v of vehicles) {
      const logs = await FuelLog.find({ vehicleId: v._id }).sort({ date: 1 });
      let totalLiters = 0;
      let totalKm = 0;
      for (let i = 0; i < logs.length; i++) {
        totalLiters += logs[i].liters || 0;
        if (logs[i].odometerAtFill != null && i > 0 && logs[i - 1].odometerAtFill != null) {
          totalKm += Math.max(0, logs[i].odometerAtFill - logs[i - 1].odometerAtFill);
        }
      }
      const kmPerLiter = totalLiters > 0 ? (totalKm / totalLiters).toFixed(2) : null;
      results.push({
        vehicleId: v._id,
        vehicleName: v.name,
        licensePlate: v.licensePlate,
        totalLiters,
        totalKm,
        kmPerLiter: kmPerLiter != null ? parseFloat(kmPerLiter) : null,
      });
    }
    return res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const vehicleRoi = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({});
    const results = [];
    for (const v of vehicles) {
      const trips = await Trip.find({ vehicleId: v._id, status: "Completed" });
      const revenue = trips.reduce((s, t) => s + (t.revenue || 0), 0);
      const { totalOperationalCost } = await aggregateCosts(v._id);
      const acq = v.acquisitionCost || 0;
      const roi = acq > 0 ? ((revenue - totalOperationalCost) / acq).toFixed(2) : null;
      results.push({
        vehicleId: v._id,
        vehicleName: v.name,
        licensePlate: v.licensePlate,
        revenue,
        totalOperationalCost,
        acquisitionCost: acq,
        roi: roi != null ? parseFloat(roi) : null,
      });
    }
    return res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const costPerKm = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({});
    const results = [];
    for (const v of vehicles) {
      const trips = await Trip.find({ vehicleId: v._id, status: "Completed" });
      const totalDistance = trips.reduce((s, t) => s + (t.distance || 0), 0);
      const { totalOperationalCost } = await aggregateCosts(v._id);
      const costPerKmVal = totalDistance > 0 ? (totalOperationalCost / totalDistance).toFixed(2) : null;
      results.push({
        vehicleId: v._id,
        vehicleName: v.name,
        licensePlate: v.licensePlate,
        totalDistance,
        totalOperationalCost,
        costPerKm: costPerKmVal != null ? parseFloat(costPerKmVal) : null,
      });
    }
    return res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const operationalCostByVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.query;
    const ids = vehicleId ? await Vehicle.find({ _id: vehicleId }).distinct("_id") : await Vehicle.find({}).distinct("_id");
    const results = [];
    for (const id of ids) {
      const costs = await aggregateCosts(id);
      const v = await Vehicle.findById(id).select("name licensePlate");
      if (v) {
        results.push({ vehicleId: id, vehicleName: v.name, licensePlate: v.licensePlate, ...costs });
      }
    }
    return res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const exportCsv = async (req, res) => {
  try {
    const { type } = req.query;
    let data = [];
    let headers = [];
    if (type === "vehicles") {
      const vehicles = await Vehicle.find({});
      headers = ["name", "model", "licensePlate", "vehicleType", "maxLoadCapacity", "odometer", "status", "region"];
      data = vehicles.map((v) => headers.map((h) => v[h] ?? ""));
    } else if (type === "trips") {
      const trips = await Trip.find({}).populate("vehicleId", "name licensePlate").populate("driverId", "name");
      headers = ["origin", "destination", "cargoWeight", "revenue", "status", "vehicle", "driver"];
      data = trips.map((t) => [
        t.origin,
        t.destination,
        t.cargoWeight,
        t.revenue,
        t.status,
        t.vehicleId?.name ?? "",
        t.driverId?.name ?? "",
      ]);
    } else if (type === "analytics") {
      const vehicles = await Vehicle.find({});
      headers = ["vehicleName", "licensePlate", "totalFuelCost", "totalMaintenanceCost", "totalOperationalCost"];
      for (const v of vehicles) {
        const c = await aggregateCosts(v._id);
        data.push([v.name, v.licensePlate, c.totalFuelCost, c.totalMaintenanceCost, c.totalOperationalCost]);
      }
    } else {
      return res.status(400).json({ message: "Export type required: vehicles, trips, or analytics." });
    }
    const csv = [headers.join(","), ...data.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=fleetflow-${type}-${Date.now()}.csv`);
    return res.send(csv);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const exportPdf = async (req, res) => {
  try {
    const PDFDocument = require("pdfkit");
    const { type } = req.query;
    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=fleetflow-${type || "report"}-${Date.now()}.pdf`);
    doc.pipe(res);
    doc.fontSize(16).text("FleetFlow Report – " + (type || "summary"), 50, 30);
    let y = 70;
    const row = (str) => {
      doc.fontSize(9).text(str, 50, y, { width: 750 });
      y += 18;
    };
    if (type === "vehicles") {
      const vehicles = await Vehicle.find({});
      doc.fontSize(10).text("Name | License | Type | Status | Max Load (kg)", 50, y);
      y += 20;
      vehicles.slice(0, 25).forEach((v) => {
        row(`${v.name} | ${v.licensePlate} | ${v.vehicleType} | ${v.status} | ${v.maxLoadCapacity}`);
      });
    } else if (type === "trips") {
      const trips = await Trip.find({}).populate("vehicleId", "name").populate("driverId", "name");
      doc.fontSize(10).text("Origin | Destination | Status | Revenue | Vehicle | Driver", 50, y);
      y += 20;
      trips.slice(0, 25).forEach((t) => {
        row(`${t.origin} | ${t.destination} | ${t.status} | ${t.revenue} | ${t.vehicleId?.name || ""} | ${t.driverId?.name || ""}`);
      });
    } else {
      const vehicles = await Vehicle.find({});
      doc.fontSize(10).text("Vehicle | Fuel Cost | Maintenance Cost | Total Operational Cost", 50, y);
      y += 20;
      for (const v of vehicles.slice(0, 20)) {
        const c = await aggregateCosts(v._id);
        row(`${v.name} (${v.licensePlate}) | ${c.totalFuelCost} | ${c.totalMaintenanceCost} | ${c.totalOperationalCost}`);
      }
    }
    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message || "PDF export failed." });
  }
};

module.exports = {
  fuelEfficiency,
  vehicleRoi,
  costPerKm,
  operationalCostByVehicle,
  exportCsv,
  exportPdf,
};
