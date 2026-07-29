const mongoose = require('mongoose');

const TrainingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a training title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  trainer: {
    type: String,
    required: [true, 'Please specify the trainer / organization'],
  },
  date: {
    type: Date,
    required: [true, 'Please specify the training date'],
  },
  venue: {
    type: String,
    required: [true, 'Please specify the venue'],
  },
  capacity: {
    type: Number,
    required: [true, 'Please specify the maximum capacity'],
    min: [1, 'Capacity must be at least 1'],
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
