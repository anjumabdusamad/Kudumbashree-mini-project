const express = require('express');
const router = express.Router();
const User = require('../models/User');
const NHG = require('../models/NHG');
const Savings = require('../models/Savings');
const Loan = require('../models/Loan');
const { protect, authorize } = require('../middleware/auth');

// Apply admin protection to all routes in this file
router.use(protect);
router.use(authorize('admin'));

// @desc    Get all users with filter (pending, approved, rejected, role)
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const { status, role } = req.query;
    const query = {};
    if (status) query.status = status;
    if (role) query.role = role;

    const users = await User.find(query).populate('nhg', 'name code');
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Approve or Reject a user registration
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
router.put('/users/:id/status', async (req, res) => {
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = status;
    await user.save();

    res.json({ success: true, message: `User registration status updated to ${status}`, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Admin manually create a pre-approved, verified member
// @route   POST /api/admin/members/create
// @access  Private/Admin
router.post('/members/create', async (req, res) => {
  const { name, email, password, phone, nhgId } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ success: false, message: 'Please provide all details' });
  }

  try {
    // Check if email already taken
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Verify NHG if provided
    let assignedNhg = null;
    if (nhgId) {
      const nhgExists = await NHG.findById(nhgId);
      if (!nhgExists) {
        return res.status(404).json({ success: false, message: 'NHG not found' });
      }
      assignedNhg = nhgId;
    }

    // Create user pre-approved and pre-verified
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'member',
      nhg: assignedNhg,
      status: 'approved',
      isVerified: true,
    });

    // Add member to NHG members array
    if (assignedNhg) {
      await NHG.findByIdAndUpdate(assignedNhg, {
        $push: { members: user._id },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Member account created successfully by Admin',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        nhg: user.nhg,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Create a new NHG
// @route   POST /api/admin/nhgs
// @access  Private/Admin
router.post('/nhgs', async (req, res) => {
  const { name, code, location } = req.body;

  if (!name || !code || !location) {
    return res.status(400).json({ success: false, message: 'Please add all required fields' });
  }

  try {
    const nhgExists = await NHG.findOne({ $or: [{ name }, { code }] });
    if (nhgExists) {
      return res.status(400).json({ success: false, message: 'NHG with this name or code already exists' });
    }

    const nhg = await NHG.create({ name, code, location });
    res.status(201).json({ success: true, nhg });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Get all NHGs with member counts and populated leaders
// @route   GET /api/admin/nhgs
// @access  Private/Admin
router.get('/nhgs', async (req, res) => {
  try {
    const nhgs = await NHG.find()
      .populate('president', 'name phone email')
      .populate('secretary', 'name phone email')
      .populate('treasurer', 'name phone email')
      .populate('members', 'name email phone status');

    res.json({ success: true, count: nhgs.length, nhgs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Update NHG Details and Leaders
// @route   PUT /api/admin/nhgs/:id
// @access  Private/Admin
router.put('/nhgs/:id', async (req, res) => {
  const { name, code, location, presidentId, secretaryId, treasurerId, status } = req.body;

  try {
    let nhg = await NHG.findById(req.params.id);
    if (!nhg) {
      return res.status(404).json({ success: false, message: 'NHG not found' });
    }

    // Update details if provided
    if (name) nhg.name = name;
    if (code) nhg.code = code;
    if (location) nhg.location = location;
    if (status) nhg.status = status;

    // Helper function to validate if user is member of the NHG
    const validateLeader = async (userId) => {
      if (!userId) return null;
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      // If user's NHG isn't this one, re-assign them
      if (user.nhg && user.nhg.toString() !== nhg._id.toString()) {
        user.nhg = nhg._id;
        await user.save();
        if (!nhg.members.includes(user._id)) {
          nhg.members.push(user._id);
        }
      }
      return user._id;
    };

    if (presidentId !== undefined) nhg.president = await validateLeader(presidentId);
    if (secretaryId !== undefined) nhg.secretary = await validateLeader(secretaryId);
    if (treasurerId !== undefined) nhg.treasurer = await validateLeader(treasurerId);

    await nhg.save();

    // Fetch updated NHG with populated data
    nhg = await NHG.findById(req.params.id)
      .populate('president', 'name phone email')
      .populate('secretary', 'name phone email')
      .populate('treasurer', 'name phone email');

    res.json({ success: true, message: 'NHG updated successfully', nhg });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
});

// @desc    Delete an NHG
// @route   DELETE /api/admin/nhgs/:id
// @access  Private/Admin
router.delete('/nhgs/:id', async (req, res) => {
  try {
    const nhg = await NHG.findById(req.params.id);
    if (!nhg) {
      return res.status(404).json({ success: false, message: 'NHG not found' });
    }

    // Reset NHG references for all members belonging to this NHG
    await User.updateMany({ nhg: req.params.id }, { nhg: null });

    // Use deleteOne instead of remove
    await NHG.deleteOne({ _id: req.params.id });

    res.json({ success: true, message: 'NHG deleted successfully and members disassociated.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Get overall financial and usage reports for dashboard
// @route   GET /api/admin/reports
// @access  Private/Admin
router.get('/reports', async (req, res) => {
  try {
    const totalMembers = await User.countDocuments({ role: 'member', status: 'approved' });
    const pendingMembers = await User.countDocuments({ role: 'member', status: 'pending' });
    const totalNHGs = await NHG.countDocuments();

    // Total Savings
    const savingsAggregate = await Savings.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalSavings = savingsAggregate.length > 0 ? savingsAggregate[0].total : 0;

    // Active Loans details
    const loans = await Loan.find({ status: 'approved' });
    const totalDisbursedLoan = loans.reduce((acc, curr) => acc + curr.amount, 0);
    const totalRemainingLoan = loans.reduce((acc, curr) => acc + curr.remainingAmount, 0);
    const totalRecoveredLoan = totalDisbursedLoan - totalRemainingLoan;

    // Savings by NHG (group savings by NHG id)
    const savingsByNhg = await Savings.aggregate([
      {
        $group: {
          _id: '$nhg',
          total: { $sum: '$amount' },
        },
      },
    ]);
    // Populate NHG details manually
    const nhgSavingsDetails = await Promise.all(
      savingsByNhg.map(async (item) => {
        const nhg = await NHG.findById(item._id).select('name code');
        return {
          nhg: nhg ? nhg.name : 'Unknown NHG',
          code: nhg ? nhg.code : 'N/A',
          totalSavings: item.total,
        };
      })
    );

    res.json({
      success: true,
      data: {
        summary: {
          totalMembers,
          pendingMembers,
          totalNHGs,
          totalSavings,
          totalDisbursedLoan,
          totalRemainingLoan,
          totalRecoveredLoan,
        },
        savingsByNhg: nhgSavingsDetails,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
