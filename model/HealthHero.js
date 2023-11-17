const mongoose = require("mongoose");

const healthHeroSchema = mongoose.Schema(
  {
    uuid: {
      type: String,
      unique: true,
      required: true,
    },
    userUuid: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    ageBracket: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
    spotlightVideo: {
      type: Array,
      default: [],
    },
    category: {
      type: String,
      required: true,
    },
    diseaseType: {
      type: Array,
      required: true,
    },
    areaOfMentoring: {
      type: Array,
      required: true,
    },
    preferrableDays: {
      type: Array,
      required: true,
    },
    numberOfHours: {
      type: Number,
      default: 0,
    },
    mentoringChannel: {
      type: String,
      required: true,
    },
    membershipPackage: {
      type: String,
      required: true,
    },
    reasonForMentoring: {
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

healthHeroSchema.virtual("User", {
  ref: "users",
  localField: "userUuid",
  foreignField: "uuid",
});

healthHeroSchema.virtual("packages", {
  ref: "packages",
  localField: "membershipPackage",
  foreignField: "uuid",
});

healthHeroSchema.set("toObject", { virtuals: true });
healthHeroSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("healthheroes", healthHeroSchema);
