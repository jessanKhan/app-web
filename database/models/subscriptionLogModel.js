const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  user_id: {
    type: String,
    ref: "Customer"
  },
  package_id:{
    type: String,
    ref: "package"
  },
  price:String,
  validity:String
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

module.exports = mongoose.model('subscription_log', categorySchema,'subscription_log');