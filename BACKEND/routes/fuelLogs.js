const express = require("express");
const { list, getOne, create, update, remove } = require("../controllers/fuelLogsController");
const { auth, requireRole } = require("../middleware/auth");

const router = express.Router();
const allowed = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];

router.get("/", auth, requireRole(...allowed), list);
router.get("/:id", auth, requireRole(...allowed), getOne);
router.post("/", auth, requireRole("Fleet Manager", "Dispatcher"), create);
router.put("/:id", auth, requireRole("Fleet Manager", "Financial Analyst"), update);
router.delete("/:id", auth, requireRole("Fleet Manager", "Financial Analyst"), remove);

module.exports = router;
