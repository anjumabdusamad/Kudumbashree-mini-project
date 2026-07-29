const express = require('express');
const router = express.Router();
const Savings = require('../models/Savings');
const User = require('../models/User');
const NHG = require('../models/NHG');
const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// @desc    Record a savings deposit
// @route   POST /api/savings
// @access  Private (Admin or NHG Leaders)
router.post('/', async (req, res) => {
  const { userId, amount, description, date } = req.body;

  if (!userId || !amount) {
    return res.status(400).json({ success: false, message: 'Please provide member ID and savings amount' });
  }

  try {
    const member = await User.findById(userId);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    if (!member.nhg) {
      return res.status(400).json({ success: false, message: 'Member is not assigned to any NHG unit' });
    }

    const nhgId = member.nhg;
    const nhg = await NHG.findById(nhgId);

    // Authorization check (Admin or Leaders of that specific NHG)
    const isAdmin = req.user.role === 'admin';
    const isLeader =
      nhg &&
      ((nhg.president && nhg.president.toString() === req.user.id) ||
        (nhg.secretary && nhg.secretary.toString() === req.user.id) ||
        (nhg.treasurer && nhg.treasurer.toString() === req.user.id));

    if (!isAdmin && !isLeader) {
      return res.status(403).json({ success: false, message: 'Not authorized to log savings for this NHG' });
    }

    // Save transaction
    const savings = await Savings.create({
      user: userId,
      nhg: nhgId,
      amount: Number(amount),
      description: description || 'Weekly Savings Deposit',
      date: date || Date.now(),
    });

    // Update member's accumulated savings balance
    member.savingsBalance += Number(amount);
    await member.save();

    res.status(201).json({ success: true, savings, updatedBalance: member.savingsBalance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Get personal savings history
// @route   GET /api/savings/my-history
// @access  Private (Member)
router.get('/my-history', async (req, res) => {
  try {
    const savings = await Savings.find({ user: req.user.id })
      .populate('nhg', 'name code')
      .sort({ date: -1 });

    res.json({ success: true, count: savings.length, savings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Get savings logs for an entire NHG
// @route   GET /api/savings/nhg/:nhgId
// @access  Private (Admin or NHG Leaders)
router.get('/nhg/:nhgId', async (req, res) => {
  try {
    // Auth validation
    const nhg = await NHG.findById(req.params.nhgId);
    const isAdmin = req.user.role === 'admin';
    const isLeader =
      nhg &&
      ((nhg.president && nhg.president.toString() === req.user.id) ||
        (nhg.secretary && nhg.secretary.toString() === req.user.id) ||
        (nhg.treasurer && nhg.treasurer.toString() === req.user.id));

    if (!isAdmin && !isLeader) {
      return res.status(403).json({ success: false, message: 'Not authorized to view savings of this NHG' });
    }

    const savings = await Savings.find({ nhg: req.params.nhgId })
      .populate('user', 'name email phone')
      .sort({ date: -1 });

    res.json({ success: true, count: savings.length, savings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
