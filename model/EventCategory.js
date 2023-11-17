const mongoose = require("mongoose");

const eventCategorySchema = mongoose.Schema({
      name: {
        type: String,
        unique: true,
        required: true,
      }
});

module.exports = mongoose.model("eventcategories", eventCategorySchema);