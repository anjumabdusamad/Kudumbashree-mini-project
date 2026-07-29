const express = require('express');
const router = express.Router();
const Training = require('../models/Training');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// @desc    Get all training programs
// @route   GET /api/trainings
// @access  Private
router.get('/', async (req, res) => {
  try {
    const trainings = await Training.find()
      .populate('registeredMembers', 'name email phone')
      .sort({ date: 1 });
    res.json({ success: true, count: trainings.length, trainings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Create a new training program
// @route   POST /api/trainings
// @access  Private/Admin
router.post('/', authorize('admin'), async (req, res) => {
  const { title, description, trainer, date, venue, capacity } = req.body;

  if (!title || !description || !trainer || !date || !venue || !capacity) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }

  try {
    const training = await Training.create({
      title,
      description,
      trainer,
      date,
      venue,
      capacity: Number(capacity),
    });

    // Create broadcast notification for everyone
    await Notification.create({
      isBroadcast: true,
      title: 'New Training Program Published',
      message: `A training on "${title}" by ${trainer} is scheduled on ${new Date(date).toLocaleDateString()} at ${venue}.`,
    });

    res.status(201).json({ success: true, training });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Register for a training program
// @route   POST /api/trainings/:id/register
// @access  Private (Member)
router.post('/:id/register', async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ success: false, message: 'Training program not found' });
    }

    // Check if member already registered
    if (training.registeredMembers.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'You are already registered for this training program' });
    }

    // Check capacity
    if (training.registeredMembers.length >= training.capacity) {
      return res.status(400).json({ success: false, message: 'Training program capacity is full' });
    }

    // Add member
    training.registeredMembers.push(req.user.id);
    await training.save();

    // Create direct notification for user
    await Notification.create({
      recipient: req.user.id,
      title: 'Registered for Training',
      message: `You have successfully registered for the training program: "${training.title}".`,
    });

    res.json({ success: true, message: 'Registered successfully', training });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
