const mongoose = require("mongoose");

const healthHeroRegistrationSchema = mongoose.Schema({
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
  mobile: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: null,
  },
  uploadStory: {
    type: String,
    required: true,
  },
  uploadDocuments: {
    type: String,
    default: null,
  },
  ageGroup: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  areaOfMentoring: {
    type: String,
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
  isActive: {
    type: Boolean,
    default: false,
    required: true,
  },
}, { timestamps: true });

healthHeroRegistrationSchema.virtual('User', {
  ref: 'users',
  localField: 'userUuid',
  foreignField: 'uuid'
});

healthHeroRegistrationSchema.set('toObject', { virtuals: true });
healthHeroRegistrationSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("healthHeroRegistrations", healthHeroRegistrationSchema);
