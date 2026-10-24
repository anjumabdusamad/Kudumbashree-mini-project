const mongoose = require('mongoose');

const NHGSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an NHG name'],
    unique: true,
    trim: true,
    minlength: [3, 'NHG name must be at least 3 characters long'],
    maxlength: [100, 'NHG name cannot exceed 100 characters'],
  },
  code: {
    type: String,
    required: [true, 'Please add an NHG code'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9_-]{2,15}$/, 'NHG code must be 2-15 alphanumeric characters without spaces'],
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
    trim: true,
    minlength: [3, 'Location must be at least 3 characters long'],
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
