const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
  title: String,
  slug: String,
  content: String
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

module.exports = mongoose.model('cms', dataSchema, 'cms');