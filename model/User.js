const { number } = require("joi");
const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    uuid: {
      type: String,
      unique: true,
      required: true,
    },
    wooCustomerId: {
      type: Number,
      default: null,
      unique: true,
      sparse: true
    },
    package: {
      type: Object,
      default: {
        uuid: "",
        name: "",
        status: "inactive", // active, inactive, expired, cancelled
        type: "",
        date: "",
        cost: 0,
        expiry: "",
      },
      required: true,
    },
    eventUuid: {
      type: String,
    },
    name: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    coverImage: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
    },
    facebookId: {
      type: String,
      default: null,
    },
    appleId: {
      type: String,
      default: null,
    },
    linkedInnId: {
      type: String,
      default: null,
    },
    loyaltyPoints: {
      type: Number,
      default: null,
    },
    mobile: {
      type: String,
      default: null,
    },
    dob: {
      type: Date,
      default: null,
    },
    ageGroup: {
      type: String,
      default: null,
    },
    gender: {
      type: String,
      default: null,
    },
    addressLine1: {
      type: String,
      default: null,
    },
    addressLine2: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      default: null,
    },
    state: {
      type: String,
      default: null,
    },
    country: {
      type: String,
      default: null,
    },
    countryCode: {
      type: String,
    },
    zipCode: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.virtual("Package", {
  ref: "packages",
  localField: "package.uuid",
  foreignField: "uuid",
});

userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("users", userSchema);
