const mongoose = require("mongoose");

memberSchema = mongoose.Schema({
  uuid: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  mobile: {
    type: String,
    unique: true,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  dob: {
    type: String,
    required: true,
  },
  addressLine1: {
    type: String,
  },
  addressLine2: {
    type: String,
  },
  zip_code: {
    type: Number,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
  },
  country: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String,
    default: null,
  },
  membershipPackage: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
    required: true,
  },
});

module.exports = mongoose.model("members", memberSchema);
