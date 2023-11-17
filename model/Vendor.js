const mongoose = require("mongoose");

const vendorSchema = mongoose.Schema(
  {
    uuid: {
      type: String,
      unique: true,
      required: true,
    },
    store_name: {
      type: String,
      required: true,
    },
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address_1: {
      type: String,
      default: null,
    },
    address_2: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
      required: true,
    },
    account_name: {
      type: String,
    },
    account_no: {
      type: String,
    },
    bank_name: {
      type: String,
    },
    bank_address: {
      type: String,
    },
    iban: {
      type: String,
    },
    swift_code: {
      type: String,
    },
    paypal_link: {
      type: String,
      default: null,
    },
    status: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("vendors", vendorSchema);
