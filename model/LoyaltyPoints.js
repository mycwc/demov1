const { number } = require("joi");
const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  uuid: {
    type: String,
    unique: true,
    required: true,
  },
  userUuid: {
      type: String,
      required: true,
  },
  points: {
      type: Number,
      required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("users", userSchema);
