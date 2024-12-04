const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  tag: { type: String, required: false },
  Approval: { type: String },

  creator: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

module.exports = mongoose.model("Post", postSchema);
