const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // Null indicates broadcast or NHG-wide
  },
  nhg: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NHG',
    default: null, // If set, broadcast to this specific NHG
  },
  isBroadcast: {
    type: Boolean,
    default: false, // If true and recipient/nhg is null, broadcast to everyone
  },
  title: {
    type: String,
    required: [true, 'Please add a notification title'],
  },
  message: {
    type: String,
    required: [true, 'Please add a notification message'],
  },
  isReadBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  isRead: {
    type: Boolean,
    default: false, // For direct recipient notifications
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Notification', NotificationSchema);
