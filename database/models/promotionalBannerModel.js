const mongoose = require('mongoose');

const dbSchema = new mongoose.Schema({
  title: String,
  img_light:String,
  img_dark:String,
  status: {
    type: String,
    enum: ["active", "inactive"],
  }
}, {
    timestamps: true,
    toObject: {
      transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  });

module.exports = mongoose.model('promotional_banner', dbSchema,'promotional_banner');