const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  user_type: {
    type: String,
    required: true,
  },
  name: String,
  mobile: String,
  password: String,
  status: {
    type: String,
    enum: ["active", "inactive"],
  },
  is_deleted: {
    type: String,
    required: true,
    default: "n",
    enum: ["n", "y"],
  },
  last_login: Date,
  last_login_ip: String,
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

module.exports = mongoose.model('User', userSchema);