const express = require("express");
const { list, listAvailableForDispatch, getOne, create, update, remove } = require("../controllers/vehiclesController");
const { auth, requireRole } = require("../middleware/auth");

const router = express.Router();
const allowed = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];

router.get("/", auth, requireRole(...allowed), list);
router.get("/available", auth, requireRole("Fleet Manager", "Dispatcher"), listAvailableForDispatch);
router.get("/:id", auth, requireRole(...allowed), getOne);
router.post("/", auth, requireRole("Fleet Manager"), create);
router.put("/:id", auth, requireRole("Fleet Manager"), update);
router.delete("/:id", auth, requireRole("Fleet Manager"), remove);

module.exports = router;
