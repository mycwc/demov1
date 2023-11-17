const mongoose = require("mongoose");

const faqSchema = mongoose.Schema({
  uuid: {
    type: String,
    unique: true,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("faqs", faqSchema);
