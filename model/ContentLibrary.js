const mongoose = require("mongoose");

contentLibrarySchema = mongoose.Schema({
  uuid: {
    type: String,
  },
  title: {
    type: String
  },
  authorName: {
    type: String,
    default: null,
  },
  type: {
    type: String,
  },
  upload: {
    type: String,
    default: null,
  },
  coverImage: {
    type: String,
  },
  uploadDate: {
    type: Date,
    default: null,
  },
  description: {
    type: String,
    default: null,
  },
  membershipType: {
    type: String,
    default: null,
  },
  category: {
    type: Array,
    default: null,
  },
  tags: {
    type: Array,
    default: null,
  },
  metaTags: {
    type: Array,
    default: null,
  },
  speakerName: {
    type: Array,
    default: null,
  },
  isDraft: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
    require: true,
  },
});

contentLibrarySchema.virtual('packages', {
  ref: 'packages',
  localField: 'membershipType',
  foreignField: 'uuid'
});

contentLibrarySchema.set('toObject', { virtuals: true });
contentLibrarySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("contentLibraries", contentLibrarySchema);
