const express = require('express');
const router = express.Router();
const Scheme = require('../models/Scheme');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// @desc    Get all government schemes
// @route   GET /api/schemes
// @access  Private
router.get('/', async (req, res) => {
  try {
    const schemes = await Scheme.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json({ success: true, count: schemes.length, schemes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Create a new government scheme
// @route   POST /api/schemes
// @access  Private/Admin
router.post('/', authorize('admin'), async (req, res) => {
  const { title, description, eligibility, benefits, applicationLink } = req.body;

  if (!title || !description || !eligibility || !benefits) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }

  try {
    const scheme = await Scheme.create({
      title,
      description,
      eligibility,
      benefits,
      applicationLink,
    });

    // Create broadcast notification
    await Notification.create({
      isBroadcast: true,
      title: 'New Government Scheme Added',
      message: `A new scheme "${title}" is available. Check details to see if you are eligible for benefits.`,
    });

    res.status(201).json({ success: true, scheme });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
