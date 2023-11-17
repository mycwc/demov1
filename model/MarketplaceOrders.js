const mongoose = require("mongoose");

const MarketplaceOrdersSchema = mongoose.Schema(
  {
    userUuid: {
      type: String,
      required: true,
    },
    wooOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    wooResponse: {
      type: Object,
      required: true,
    },
    stripeIntent: {
      type: Object,
      required: false,
    },
    wooResponse: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true }
);

MarketplaceOrdersSchema.virtual("Users", {
  ref: "users",
  localField: "userUuid",
  foreignField: "uuid",
});

MarketplaceOrdersSchema.set("toObject", { virtuals: true });
MarketplaceOrdersSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("MarketplaceOrders", MarketplaceOrdersSchema);
