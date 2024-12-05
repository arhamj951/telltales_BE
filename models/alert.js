const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const alertSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  creator: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User",
  },
  read: { type: Boolean, required: false },
});

module.exports = mongoose.model("Alert", alertSchema);
