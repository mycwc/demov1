const mongoose = require("mongoose");

const businessPartnerSchema = mongoose.Schema(
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
    link: {
      type: String,
      require: true,
    },
    type: {
      type: Number,
      require: true,
    },
    expiryDate: {
      type: Date,
      require: true,
    },
    emailId: {
      type: String,
      require: true,
    },
    countryCode: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      require: true,
    },
    status: {
      type: Boolean,
      default: true,
      require: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("businesspartners", businessPartnerSchema);
