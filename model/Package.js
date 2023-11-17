const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const packageSchema = mongoose.Schema({
    uuid: {
        type: String,
        unique: true,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      colour: {
        type: String,
        default: "#ff0000",
      },
      eventDiscount: {
        type: Number,
        default: 0,
        required: true,
      },
      annualCost: {
        type: Number,
        required: true,
      },
      monthlyCost: {
        type: Number
      },
      benefits: {
        type: Array,
        required: true,
      },
      numberOfHealthHeroSessions: {
        type: Number
      },
      numberOfWellnessSupportGroups: {
        type: Number
      },
      isActive: {
          type: Boolean,
          default: true,
          required: true,
      }
});



packageSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("packages", packageSchema);