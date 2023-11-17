const mongoose = require("mongoose");

const UserEventSchema = mongoose.Schema({
  userUuid: {
    type: String,
    required: true,
  },
  eventUuid: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: '1'
  },
  isActive: {
    type: Boolean,
    default: true,
    required: true,
  }
}, { timestamps: true });

// UserEventSchema.index({"userUuid": 1, "eventUuid": 1}, { "unique": true })

UserEventSchema.virtual('Users', {
  ref: 'users',
  localField: 'userUuid',
  foreignField: 'uuid'
});

UserEventSchema.virtual('Event', {
  ref: 'events',
  localField: 'eventUuid',
  foreignField: 'uuid'
});

UserEventSchema.set('toObject', { virtuals: true });
UserEventSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("userevents", UserEventSchema);
