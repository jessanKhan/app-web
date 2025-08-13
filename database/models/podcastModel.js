const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  title: String,
  description:String,
  podcast: String,
  lyricist:String,
  composer:String,
  album_movie_name:String,
  star_cast:String,
  director:String,
  track_language:String,
  releasing_year:String,
  thumb_img:String,
  media_file:String,
  categories:Array,//Genre
  artists:Array,//Vocal
  actors:Array,
  mood:String,
  event:String,
  music_label:String,
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
  playCount:{
    type: Number,
    default : 0
  },
  downloadCount:{
    type: Number,
    default : 0
  },
  viewCount:{
    type: Number,
    default : 0
  },
  updated_by:String,
  duration:String,
  featured: {
    type: Boolean,
    default : false
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

module.exports = mongoose.model('podcast', categorySchema,'podcast');