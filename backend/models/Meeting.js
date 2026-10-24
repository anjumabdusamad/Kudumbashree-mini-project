const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema({
  nhg: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NHG',
    required: [true, 'Meeting must belong to an NHG'],
  },
  date: {
    type: Date,
    required: [true, 'Please add a meeting date'],
  },
  time: {
    type: String,
    required: [true, 'Please add a meeting time'],
    trim: true,
  },
  venue: {
    type: String,
    required: [true, 'Please add a venue'],
    trim: true,
    minlength: [2, 'Venue must be at least 2 characters long'],
    maxlength: [100, 'Venue cannot exceed 100 characters'],
  },
  agenda: {
    type: String,
    required: [true, 'Please add a meeting agenda'],
    trim: true,
    minlength: [3, 'Agenda must be at least 3 characters long'],
    maxlength: [500, 'Agenda cannot exceed 500 characters'],
  },
  attendance: [
    {
      member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      status: {
        type: String,
        enum: ['present', 'absent'],
        default: 'present',
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Meeting', MeetingSchema);
