const mongoose = require('mongoose');

const SchemeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a scheme title'],
    trim: true,
    minlength: [3, 'Scheme title must be at least 3 characters long'],
    maxlength: [120, 'Scheme title cannot exceed 120 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please add a scheme description'],
    trim: true,
    minlength: [5, 'Description must be at least 5 characters long'],
  },
  eligibility: {
    type: String,
    required: [true, 'Please specify eligibility criteria'],
    trim: true,
    minlength: [3, 'Eligibility must be at least 3 characters long'],
  },
  benefits: {
    type: String,
    required: [true, 'Please specify the scheme benefits'],
    trim: true,
    minlength: [3, 'Benefits must be at least 3 characters long'],
  },
  applicationLink: {
    type: String,
    default: '',
    trim: true,
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
