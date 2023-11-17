const mongoose = require("mongoose");

const countriesSchema = mongoose.Schema({
  countryName: {
    type: String,
    required: true,
  },
  countryCallingCode: {
    type: String,
    trim: true,
    required: true,
  },
  countryCode: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("countries", countriesSchema);