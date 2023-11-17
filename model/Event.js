const mongoose = require("mongoose");

const eventSchema = mongoose.Schema(
  {
    uuid: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      unique: true,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number,
    },
    eventMode: {
      type: String,
      required: true,
    },
    meetingType: {
      type: String,
    },
    zoomEventId: {
      type: String,
      default: null,
    },
    eventLink: {
      type: String,
      default: null,
    },
    eventCategory: {
      type: String,
      required: true,
    },
    membershipPackage: {
      type: String,
      required: true,
    },
    registrationLink: {
      type: String,
      default: null,
    },
    speakers: {
      type: Array,
    },
    status: {
      type: Number,
      default: 1,
      required: true,
    },
  },
  { timestamps: true }
);

eventSchema.virtual("packages", {
  ref: "packages",
  localField: "membershipPackage",
  foreignField: "uuid",
});

eventSchema.virtual("EventRegisteredUsers", {
  ref: "userevents",
  localField: "uuid",
  foreignField: "eventUuid",
  count: true,
});

eventSchema.set("toObject", { virtuals: true });
eventSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("events", eventSchema);
