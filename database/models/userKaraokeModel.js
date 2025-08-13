const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  user_id: {
    type: String,
    ref: "Customer"
  },
  song_id:{
    type: String,
    ref: "karaoke"
  },
  karaoke_file:String,
  output_file:String,
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

module.exports = mongoose.model('user_karaoke', categorySchema,'user_karaoke');