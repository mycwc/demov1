const mongoose = require("mongoose");

const cartSchema = mongoose.Schema(
  {
    uuid: {
      type: String,
      unique: true,
      required: true,
    },
    productId: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    categoryId: {
      type: String,
      required: true,
    },
    customerId: {
      type: String,
      required: true,
    },
    inWishlist: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: true }
);

cartSchema.index(
  { productId: 1, customerId: 1, inWishlist: 1 },
  { unique: true }
);

module.exports = mongoose.model("cart", cartSchema);
