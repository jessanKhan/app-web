const mongoose = require('mongoose');

const dbSchema = new mongoose.Schema({
  title: String,
  image:String,
  user_id: String
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

module.exports = mongoose.model('user_playlist', dbSchema);