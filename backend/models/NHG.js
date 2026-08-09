const mongoose = require('mongoose');

const NHGSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an NHG name'],
    unique: true,
  },
  code: {
    type: String,
    required: [true, 'Please add an NHG code'],
    unique: true,
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
  },
  president: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  secretary: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  treasurer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  contactPerson: {
    type: String,
    default: null,
  },
  phone: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('NHG', NHGSchema);
