const express = require("express");

const alertsControllers = require("../controllers/alerts-controllers");

const router = express.Router();

router.get("/", alertsControllers.getAlerts);
router.get("/:uid/alerts", alertsControllers.getAllAlerts);
router.post("/", alertsControllers.createAlert);
router.post("/updatealert/:alertId", alertsControllers.updateAlert);
router.delete("/deletealerts");

module.exports = router;
