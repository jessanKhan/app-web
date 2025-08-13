const mongoose = require('mongoose');
const { ObjectId } = require("mongoose");
const wishlistSchema = new mongoose.Schema({
  song_id: {
    type: ObjectId,
    ref: "song",
  },
  user_id: String,
  is_deleted:String
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

module.exports = mongoose.model('wishlist', wishlistSchema);