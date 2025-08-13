const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  user_id: {
    type: String,
    ref: "Customer"
  },
  song_id:{
    type: String,
    ref: "song"
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

module.exports = mongoose.model('song_play_log', categorySchema,'song_play_log');