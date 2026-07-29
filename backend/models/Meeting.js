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
  },
  venue: {
    type: String,
    required: [true, 'Please add a venue'],
  },
  agenda: {
    type: String,
    required: [true, 'Please add a meeting agenda'],
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
