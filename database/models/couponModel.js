const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  title: String,
  value:String,
  coupon_code:String,
  start_date:Date,
  end_date:Date,
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
  value_type: String,
  no_of_usage: String
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

module.exports = mongoose.model('coupon_code', categorySchema,'coupon_code');