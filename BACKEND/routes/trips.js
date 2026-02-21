const express = require("express");
const { list, getOne, create, update, updateStatus, remove } = require("../controllers/tripsController");
const { auth, requireRole } = require("../middleware/auth");

const router = express.Router();
const allowed = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];

router.get("/", auth, requireRole(...allowed), list);
router.get("/:id", auth, requireRole(...allowed), getOne);
router.post("/", auth, requireRole("Fleet Manager", "Dispatcher"), create);
router.put("/:id", auth, requireRole("Fleet Manager", "Dispatcher"), update);
router.patch("/:id/status", auth, requireRole("Fleet Manager", "Dispatcher"), updateStatus);
router.delete("/:id", auth, requireRole("Fleet Manager", "Dispatcher"), remove);

module.exports = router;
