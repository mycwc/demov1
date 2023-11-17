const mongoose = require("mongoose");

const sliderSchema = mongoose.Schema({
  uuid: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  product_id: {
    type: String,
    default: null,
  },
  category_id: {
    type: String,
    default: null,
  },
  vendor_id: {
    type: String,
    default: null,
  },
  link: {
    type: String,
    default: null,
  },
  type: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("sliders", sliderSchema);
