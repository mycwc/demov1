const mongoose = require("mongoose");

const businessPartnerRequestSchema = mongoose.Schema(
  {
    uuid: {
      type: String,
      require: true,
    },
    name: {
      type: String,
      require: true,
    },
    logo: {
      type: String,
      require: true,
    },
    description: {
      type: String,
      require: true,
    },
    addressLine1: {
      type: String,
    },
    addressLine2: {
      type: String,
    },
    link: {
      type: String,
      require: true,
    },
    city: {
      type: String,
      require: true,
    },
    state: {
      type: String,
      require: true,
    },
    country: {
      type: String,
      require: true,
    },
    zipCode: {
      type: String,
      require: true,
    },
    type: {
      type: Number,
      require: true,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    emailId: {
      type: String,
      unique: true,
      require: true,
    },
    countryCode: {
      type: Number,
      required: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
      require: true,
    },
    status: {
      type: Boolean,
      default: false,
      require: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "businesspartnerrequests",
  businessPartnerRequestSchema
);
