const mongoose = require("mongoose");

const eventVoucherSchema = mongoose.Schema(
  {
    uuid: {
      type: String,
      unique: true,
      required: true,
    },
    eventUuid: {
      type: String,
      required: true,
    },
    membershipUuid: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    discountAmount: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    used: {
      type: Number,
      default: 0,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    status: {
      type: Boolean,
      default: false,
      required: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

eventVoucherSchema.set("toObject", { virtuals: true });
eventVoucherSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("eventvouchers", eventVoucherSchema);
