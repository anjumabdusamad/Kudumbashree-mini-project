const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// @desc    Get all notifications for logged in user
// @route   GET /api/notifications
// @access  Private
router.get('/', async (req, res) => {
  try {
    // Return notifications if they:
    // 1. Are directly sent to this user
    // 2. Are broadcast to this user's NHG
    // 3. Are a global broadcast
    const query = {
      $or: [
        { recipient: req.user.id },
        { isBroadcast: true },
      ],
    };

    if (req.user.nhg) {
      query.$or.push({ nhg: req.user.nhg });
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 });

    // Format output to add a client-side flag if this user has read this specific notification
    const formattedNotifications = notifications.map((notif) => {
      let isRead = notif.isRead;
      if (notif.isBroadcast || notif.nhg) {
        isRead = notif.isReadBy.includes(req.user.id);
      }
      return {
        _id: notif._id,
        title: notif.title,
        message: notif.message,
        createdAt: notif.createdAt,
        isRead,
      };
    });

    res.json({ success: true, count: formattedNotifications.length, notifications: formattedNotifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notif.isBroadcast || notif.nhg) {
      // For broadcasts/group notifications, push user id to isReadBy if not already there
      if (!notif.isReadBy.includes(req.user.id)) {
        notif.isReadBy.push(req.user.id);
        await notif.save();
      }
    } else {
      // For direct notifications, just update the boolean flag
      notif.isRead = true;
      await notif.save();
    }

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
