const express = require("express");
// const { check } = require("express-validator");

const nodemailerController = require("../controllers/nodemailer-controllers");

const router = express.Router();

router.post("/forgot-password", nodemailerController.forgotPassword);

module.exports = router;
