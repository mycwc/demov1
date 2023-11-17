const mongoose = require("mongoose");

const supportGroupSchema = mongoose.Schema({
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
  groupLeader: {
    type: String,
  },
  numberOfMembers: {
    type: Number,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  state: {
    type: String,
  },
  city: {
    type: String,
  },
  groupCategory: {
    type: String,
    required: true,
  },
  membershipPackage: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String,
  },
  members: {
    type: Array,
    default: null,
  },
  groupLeader: {
    type: String,
    default: null,
  },
  groupLink: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true,
  }
});

supportGroupSchema.virtual('packages', {
  ref: 'packages',
  localField: 'membershipPackage',
  foreignField: 'uuid'
});

supportGroupSchema.virtual('MemeberSupportGroup', {
  ref: 'membersupportgroups',
  localField: 'uuid',
  foreignField: 'supportGroupUuid',
  count: true,
});

supportGroupSchema.set('toObject', { virtuals: true });
supportGroupSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("supportgroups", supportGroupSchema);
