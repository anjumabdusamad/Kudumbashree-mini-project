const mongoose = require('mongoose');

const SchemeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a scheme title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a scheme description'],
  },
  eligibility: {
    type: String,
    required: [true, 'Please specify eligibility criteria'],
  },
  benefits: {
    type: String,
    required: [true, 'Please specify the scheme benefits'],
  },
  applicationLink: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Scheme', SchemeSchema);
