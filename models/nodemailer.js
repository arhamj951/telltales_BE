const nodemailer = require("nodemailer");

// Create a transporter using MailDev's SMTP server
const transporter = nodemailer.createTransport({
  host: "localhost", // MailDev SMTP server
  port: 1025, // MailDev SMTP port
  secure: false, // No TLS required
});

module.exports = transporter;
