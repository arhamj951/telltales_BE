const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../models/user");
const transporter = require("../models/nodemailer");

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const resetToken = crypto.randomBytes(32).toString("hex");
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }

    user.resetToken = resetToken;
    user.tokenExpiration = Date.now() + 3600000;
    await user.save();

    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: "Tell Tales <BOT@telltales.com>",
      to: email,
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
