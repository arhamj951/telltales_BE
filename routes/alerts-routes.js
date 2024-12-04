const express = require("express");

const alertsControllers = require("../controllers/alerts-controllers");

const router = express.Router();

router.get("/", alertsControllers.getAlerts);
router.post("/", alertsControllers.createAlert);
router.get("/:uid/alerts", alertsControllers.getAllAlerts);
router.delete("/deletealerts");

module.exports = router;
