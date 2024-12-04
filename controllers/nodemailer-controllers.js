const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../models/user");
const transporter = require("../models/nodemailer");

// Password reset endpoint
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Generate a password reset token (using crypto for randomness)
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Find the user in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Save the reset token and token expiration time in the database
    user.resetToken = resetToken;
    user.tokenExpiration = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();

    // Construct the password reset link
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    // Send the reset link via email
    await transporter.sendMail({
      from: "Tell Tales <BOT@telltales.com>", // Sender email
      to: email, // Recipient email
      subject: "Password Reset Request",
      text: `You requested a password reset. Click here to reset your password: ${resetLink}`,
      html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    });

    res.send("Password reset email sent.");
  } catch (error) {
    console.error("Error in forgot-password:", error);
    res.status(500).send("Internal server error");
  }
};

exports.forgotPassword = forgotPassword;
