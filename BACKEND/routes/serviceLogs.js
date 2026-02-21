const express = require("express");
const { list, getOne, create, update, remove } = require("../controllers/serviceLogsController");
const { auth, requireRole } = require("../middleware/auth");

const router = express.Router();
const allowed = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];

router.get("/", auth, requireRole(...allowed), list);
router.get("/:id", auth, requireRole(...allowed), getOne);
router.post("/", auth, requireRole("Fleet Manager", "Safety Officer"), create);
router.put("/:id", auth, requireRole("Fleet Manager", "Safety Officer"), update);
router.delete("/:id", auth, requireRole("Fleet Manager"), remove);

module.exports = router;
