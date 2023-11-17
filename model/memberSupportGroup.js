const mongoose = require("mongoose");

memberSupportGroupSchema = mongoose.Schema({
  userUuid: {
    type: String,
    required: true,
  },
  supportGroupUuid: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: null,
  },
});

memberSupportGroupSchema.virtual("User", {
  ref: "users",
  localField: "userUuid",
  foreignField: "uuid",
});
memberSupportGroupSchema.virtual("SupportGroup", {
  ref: "supportgroups",
  localField: "supportGroupUuid",
  foreignField: "uuid",
});

memberSupportGroupSchema.set("toObject", { virtuals: true });
memberSupportGroupSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model(
  "membersupportgroups",
  memberSupportGroupSchema
);
