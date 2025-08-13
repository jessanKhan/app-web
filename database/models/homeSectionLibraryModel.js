const mongoose = require('mongoose');
const { ObjectId } = require("mongoose");

const dbSchema = new mongoose.Schema({
  title: String,
  section:  Array,
  img:String,
  notification_type: String,
  notification_sub_type: String,
  banner_image:String,
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
  start_date: Date,
  end_date: Date,
  expiry_days: String,
  songs:Array,
  playlistBy: String,
  artist: String,
  actor: String,
  playlist: String,
  film: String,
  song: String,
  podcast: String
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

module.exports = mongoose.model('home_section_library', dbSchema, 'home_section_library');