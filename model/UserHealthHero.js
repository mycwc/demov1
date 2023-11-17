const mongoose = require("mongoose");

const userHealthHeroSchema = mongoose.Schema({
  uuid: {
    type: String,
    unique: true,
    required: true,
  },
  userUuid: {
    type: String,
    required: true,
  },
  healthHeroUuid: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    required: true,
  },
  sessionDate: {
    type: Date,
    default: null,
  },
  sessionTime: {
    type: Date,
    default: null,
  },
  sessionPurpose: {
    type: String,
    default: null,
  },
  otherProblems: {
    type: String,
    default: null,
  },
  consultation: {
    type: String,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: null,
  }
});

module.exports = mongoose.model("userhealthheroes", userHealthHeroSchema);
