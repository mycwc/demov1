const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
    },
    userUuid: {
      type: String,
      required: true,
    },
    packageUuid: {
      type: String,
    },
    packageTerm: {
      type: String,
    },
    eventUuid: {
      type: String,
    },
    orderId: {
      type: String
    },
    promoCodeUuid: {
      type: String,
    },
    payment_intent: {
      type: String,
    },
    client_secret: {
      type: String,
    },
    transactionDate: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      default: "Net Banking",
      required: true,
    },
    amount: {
      type: Number,
    },
    discountAmount: {
      type: Number,
    },
    total: {
      type: Number,
    },
    isCredit: {
      type: Boolean,
      default: false,
      required: true,
    },
    remarks: {
      type: String,
    }
  },
  { timestamps: true }
);

paymentSchema.virtual("Event", {
  ref: "events",
  localField: "eventUuid",
  foreignField: "uuid",
});

paymentSchema.virtual("User", {
  ref: "users",
  localField: "userUuid",
  foreignField: "uuid",
});

paymentSchema.set("toObject", { virtuals: true });
paymentSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("payments", paymentSchema);
