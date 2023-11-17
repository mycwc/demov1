const mongoose = require("mongoose");

const voucherSchema = mongoose.Schema({
  uuid: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  membershipPackage: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  voucherCode: {
    type: String,
    required: true,
    unique: true,
  },
  numberOfVouchers: {
    type: Number,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  discountType: {
    type: String,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  termsAndConditions: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  coverImage: {
    type: String,
    default: null,
  },
});

voucherSchema.virtual('Package', {
  ref: 'packages',
  localField: 'membershipPackage',
  foreignField: 'uuid'
});

module.exports = mongoose.model("vouchers", voucherSchema);
