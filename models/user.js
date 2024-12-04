const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: false },
  admin: { type: Boolean, required: true },
  posts: [{ type: mongoose.Types.ObjectId, required: false, ref: "Post" }],
  alerts: [{ type: mongoose.Types.ObjectId, required: false, ref: "Alert" }],
  resetToken: { type: String, required: false }, // Add resetToken to store the reset token
  tokenExpiration: { type: Date, required: false }, // Add tokenExpiration to store the expiration time of the reset token
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
