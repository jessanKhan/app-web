const mongoose = require('mongoose');

const dbSchema = new mongoose.Schema({
  title: String,
  is_deleted: {
    type: String,
    required: true,
    default: "n",
    enum: ["n", "y"],
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
  },
  order:Number,
  banner_image : String
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

module.exports = mongoose.model('home_section', dbSchema,'home_section');