const express = require("express");
const { getKpis } = require("../controllers/dashboardController");
const { auth, requireRole } = require("../middleware/auth");

const router = express.Router();
const allowed = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];

router.get("/kpis", auth, requireRole(...allowed), getKpis);

module.exports = router;
