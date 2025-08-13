const mongoose = require('mongoose');
const { ObjectId } = require("mongoose");

const dbSchema = new mongoose.Schema({
  mood_id: ObjectId,
  song_id: { type: ObjectId, ref: "song" },
  position: Number
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

module.exports = mongoose.model('mood_song_order', dbSchema, 'mood_song_order');