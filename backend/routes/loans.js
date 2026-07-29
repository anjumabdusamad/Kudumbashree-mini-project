const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const User = require('../models/User');
const NHG = require('../models/NHG');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// @desc    Apply for a loan
// @route   POST /api/loans
// @access  Private (Member)
router.post('/', async (req, res) => {
  const { amount, purpose, durationMonths } = req.body;

  if (!amount || !purpose || !durationMonths) {
    return res.status(400).json({ success: false, message: 'Please provide amount, purpose, and duration' });
  }

  if (!req.user.nhg) {
    return res.status(400).json({ success: false, message: 'You must belong to an NHG to apply for a loan' });
  }

  try {
    // Check if user already has an active (unpaid) loan
    const activeLoan = await Loan.findOne({
      user: req.user.id,
      status: { $in: ['pending', 'approved'] },
    });

    if (activeLoan) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active loan application or outstanding loan.',
      });
    }

    const interestRate = 4; // 4% standard annual interest
    // Math: totalInterest = Principal * rate% * (months / 12)
    const totalInterest = Number(amount) * (interestRate / 100) * (Number(durationMonths) / 12);
    const totalPayable = Number(amount) + totalInterest;
    const monthlyInstallment = Math.round(totalPayable / Number(durationMonths));

    const loan = await Loan.create({
      user: req.user.id,
      nhg: req.user.nhg,
      amount: Number(amount),
      purpose,
      interestRate,
      durationMonths: Number(durationMonths),
      monthlyInstallment,
      remainingAmount: Math.round(totalPayable),
      status: 'pending',
    });

    // Notify NHG leaders and Admins
    await Notification.create({
      nhg: req.user.nhg,
      title: 'New Loan Application',
      message: `${req.user.name} has applied for a loan of ₹${amount} for "${purpose}".`,
    });

    res.status(201).json({ success: true, message: 'Loan application submitted successfully', loan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Get personal loans
// @route   GET /api/loans/my-loans
// @access  Private (Member)
router.get('/my-loans', async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.user.id })
      .populate('nhg', 'name code')
      .sort({ applicationDate: -1 });

    res.json({ success: true, count: loans.length, loans });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Get all loans for an NHG
// @route   GET /api/loans/nhg/:nhgId
// @access  Private (Admin or NHG Leaders)
router.get('/nhg/:nhgId', async (req, res) => {
  try {
    const nhg = await NHG.findById(req.params.nhgId);
    const isAdmin = req.user.role === 'admin';
    const isLeader =
      nhg &&
      ((nhg.president && nhg.president.toString() === req.user.id) ||
        (nhg.secretary && nhg.secretary.toString() === req.user.id) ||
        (nhg.treasurer && nhg.treasurer.toString() === req.user.id));

    if (!isAdmin && !isLeader) {
      return res.status(403).json({ success: false, message: 'Not authorized to view loans of this NHG' });
    }

    const loans = await Loan.find({ nhg: req.params.nhgId })
      .populate('user', 'name email phone')
      .sort({ applicationDate: -1 });

    res.json({ success: true, count: loans.length, loans });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Get all loans in the system (Admin only)
// @route   GET /api/loans/all
// @access  Private/Admin
router.get('/all', authorize('admin'), async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate('user', 'name email phone')
      .populate('nhg', 'name code')
      .sort({ applicationDate: -1 });

    res.json({ success: true, count: loans.length, loans });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Approve/Reject loan application
// @route   PUT /api/loans/:id/status
// @access  Private/Admin
router.put('/:id/status', authorize('admin'), async (req, res) => {
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan application not found' });
    }

    if (loan.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Loan has already been processed' });
    }

    loan.status = status;
    if (status === 'approved') {
      loan.approvalDate = Date.now();
      // Send amount to member (credit walletBalance)
      const member = await User.findById(loan.user);
      if (member) {
        member.walletBalance = (member.walletBalance || 0) + loan.amount;
        await member.save();
      }
    }
    await loan.save();

    // Notify user
    await Notification.create({
      recipient: loan.user,
      title: `Loan Request ${status.toUpperCase()}`,
      message: `Your loan application of ₹${loan.amount} has been ${status} by the administrator.`,
    });

    res.json({ success: true, message: `Loan status updated to ${status}`, loan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Pay loan installment
// @route   POST /api/loans/:id/repay
// @access  Private
router.post('/:id/repay', async (req, res) => {
  const { amount, reference } = req.body;

  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ success: false, message: 'Please specify a valid payment amount' });
  }

  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    if (loan.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Repayments can only be logged for approved loans' });
    }

    // Process payment
    const payment = Number(amount);
    loan.remainingAmount = Math.max(0, loan.remainingAmount - payment);

    loan.repayments.push({
      amount: payment,
      reference: reference || 'Online Payment',
      date: Date.now(),
    });

    // Check if fully paid off
    if (loan.remainingAmount <= 0) {
      loan.status = 'paid';
    }

    await loan.save();

    // Notify user (if logged by someone else) or just confirm
    res.json({
      success: true,
      message: loan.status === 'paid' ? 'Loan fully paid off!' : 'Repayment logged successfully',
      loan,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
