const express = require("express");
const {
  fuelEfficiency,
  vehicleRoi,
  costPerKm,
  operationalCostByVehicle,
  exportCsv,
  exportPdf,
} = require("../controllers/analyticsController");
const { auth, requireRole } = require("../middleware/auth");

const router = express.Router();
const analyst = ["Fleet Manager", "Financial Analyst"];

router.get("/fuel-efficiency", auth, requireRole(...analyst), fuelEfficiency);
router.get("/vehicle-roi", auth, requireRole(...analyst), vehicleRoi);
router.get("/cost-per-km", auth, requireRole(...analyst), costPerKm);
router.get("/operational-cost", auth, requireRole(...analyst), operationalCostByVehicle);
router.get("/export/csv", auth, requireRole(...analyst), exportCsv);
router.get("/export/pdf", auth, requireRole(...analyst), exportPdf);

module.exports = router;
