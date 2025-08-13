const mongoose = require('mongoose');
const { ObjectId } = require("mongoose");

const dbSchema = new mongoose.Schema({
  notification_id: { type: ObjectId, ref: "notification" },
  user_id: { type: ObjectId, ref: "Customer" },
  notify_date: { type: Date },
  status:{type : String}
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

module.exports = mongoose.model('user_notification', dbSchema);