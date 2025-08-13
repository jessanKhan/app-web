const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name :  String, 
    dob :  String, 
    mobile :  String, 
    email :  String, 
    gender : String, 
    country: String,
    profile_pic : String, 
    login_source : String, 
    subscription_status : {
        type: String,
        default: 'inactive',
        required: true,
    },
    communication_flg :  {
        type: Boolean,
        default: true,
        required: true,
      }, 
    profile_completed_flg :  Boolean, 
    is_active:{
        type: Boolean,
        default: true,
        required: true,
      },
    is_deleted:{
        type: String,
        default: "N",
        required: true,
      },
    last_login: String,
    password: String,
    subscription_expiry_date : Date,
    subscription_package : {
      type: String,
      default: "",
    },
    device_id: String,
    unsubscribe_by: String,
    reset_token: String
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

module.exports = mongoose.model('Customer', customerSchema);