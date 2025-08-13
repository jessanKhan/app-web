const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  title: String,
  description: String,
  vocal:String,
  lyricist:String,
  composer:String,
  lyrics:String,
  song:String,
  is_deleted: {
    type: String,
    required: true,
    default: "n",
    enum: ["n", "y"],
  },
  status: {
    type: String,
    default: "active",
    enum: ["active", "inactive"],
  },
  updated_by:String,
  duration:String,
  lyricsData:String,
  image:String,
  playCount:{
    type: Number,
    default : 0
  },
  downloadCount:{
    type: Number,
    default : 0
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

module.exports = mongoose.model('karaoke', categorySchema,'karaoke');