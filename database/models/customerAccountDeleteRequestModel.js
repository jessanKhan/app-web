const mongoose = require('mongoose');
const { ObjectId } = require("mongoose");

const customerSchema = new mongoose.Schema({
    user_id :  {
      type: ObjectId, 
      ref: "Customer" 
    }, 
    status_updated_by :  String, 
    status :  {
      type: Boolean,
      default: true,
      required: true,
    }, 
}, {
    timestamps: true,
    toObject: {
      transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  });

module.exports = mongoose.model('Customer_account_deleted_request', customerSchema);