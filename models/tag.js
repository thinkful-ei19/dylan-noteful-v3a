'use strict';

const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: { type: String, unique: true }
});

tagSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('Tag', tagSchema);