const mongoose = require('mongoose');

const onlinecustomerOtpSchema = new mongoose.Schema({
    mobile :  String,
    email :  String,
    otp_code:String,
    is_active:String,
    is_verified:String
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

module.exports = mongoose.model('customer_otp', onlinecustomerOtpSchema,'customer_otp');