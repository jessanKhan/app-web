const mongoose = require('mongoose');

const dbSchema = new mongoose.Schema({
  position: Number,
  content_type:String,
  content_id:String,
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

module.exports = mongoose.model('content_order', dbSchema);