const express = require("express");
const nodemailerController = require("../controllers/nodemailer-controllers");
const router = express.Router();

router.post("/forgot-password", nodemailerController.forgotPassword);

module.exports = router;
