const mongoose = require('mongoose');

const TrainingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a training title'],
    trim: true,
    minlength: [3, 'Training title must be at least 3 characters long'],
    maxlength: [120, 'Training title cannot exceed 120 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true,
    minlength: [5, 'Description must be at least 5 characters long'],
  },
  trainer: {
    type: String,
    required: [true, 'Please specify the trainer / organization'],
    trim: true,
    minlength: [2, 'Trainer name must be at least 2 characters long'],
  },
  date: {
    type: Date,
    required: [true, 'Please specify the training date'],
  },
  venue: {
    type: String,
    required: [true, 'Please specify the venue'],
    trim: true,
    minlength: [2, 'Venue must be at least 2 characters long'],
  },
  capacity: {
    type: Number,
    required: [true, 'Please specify the maximum capacity'],
    min: [1, 'Capacity must be at least 1'],
    max: [1000, 'Capacity cannot exceed 1000 participants'],
  },
  registeredMembers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Training', TrainingSchema);
