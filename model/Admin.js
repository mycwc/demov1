const mongoose = require("mongoose");

const adminSchema = mongoose.Schema({
    uuid: {
        type: String,
        unique: true,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      countryCode: {
        type: Number,
        trim: true,
        required: true,
      },
      phone: {
        type: String,
        trim: true,
        unique: true,
        required: true,
      },
      email: {
        type: String,
        trim: true,
        unique: true,
        required: true,
      },
      password: {
        type: String,
        required: true,
      },
      avatar: {
        type: String,
      }
});

module.exports = mongoose.model("admins", adminSchema);