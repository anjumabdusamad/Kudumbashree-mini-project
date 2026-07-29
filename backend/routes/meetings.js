const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const NHG = require('../models/NHG');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// @desc    Schedule a new meeting
// @route   POST /api/meetings
// @access  Private (Admin or NHG Leaders)
router.post('/', async (req, res) => {
  const { nhgId, date, time, venue, agenda } = req.body;

  if (!nhgId || !date || !time || !venue || !agenda) {
    return res.status(400).json({ success: false, message: 'Please add all required fields' });
  }

  try {
    // Check if user has permission (Admin or NHG leader)
    const nhg = await NHG.findById(nhgId);
    if (!nhg) {
      return res.status(404).json({ success: false, message: 'NHG not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isLeader =
      (nhg.president && nhg.president.toString() === req.user.id) ||
      (nhg.secretary && nhg.secretary.toString() === req.user.id) ||
      (nhg.treasurer && nhg.treasurer.toString() === req.user.id);

    if (!isAdmin && !isLeader) {
      return res.status(403).json({ success: false, message: 'Not authorized to schedule meetings for this NHG' });
    }

    // Set initial attendance for all NHG members (status defaults to absent until marked present)
    const attendance = nhg.members.map((memberId) => ({
      member: memberId,
      status: 'absent',
    }));

    const meeting = await Meeting.create({
      nhg: nhgId,
      date,
      time,
      venue,
      agenda,
      attendance,
    });

    // Create a notification for all NHG members
    await Notification.create({
      nhg: nhgId,
      title: 'New Meeting Scheduled',
      message: `A meeting has been scheduled for ${new Date(date).toLocaleDateString()} at ${time}. Venue: ${venue}. Agenda: ${agenda}`,
    });

    res.status(201).json({ success: true, meeting });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Get meetings for logged in user's NHG
// @route   GET /api/meetings/my-nhg
// @access  Private
router.get('/my-nhg', async (req, res) => {
  if (!req.user.nhg) {
    return res.status(400).json({ success: false, message: 'User is not assigned to any NHG' });
  }

  try {
    const meetings = await Meeting.find({ nhg: req.user.nhg })
      .populate('nhg', 'name code')
      .sort({ date: -1 });
    res.json({ success: true, count: meetings.length, meetings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Get meetings for a specific NHG
// @route   GET /api/meetings/nhg/:nhgId
// @access  Private
router.get('/nhg/:nhgId', async (req, res) => {
  try {
    const meetings = await Meeting.find({ nhg: req.params.nhgId })
      .populate('nhg', 'name code')
      .sort({ date: -1 });
    res.json({ success: true, count: meetings.length, meetings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Get specific meeting details
// @route   GET /api/meetings/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate('nhg', 'name code')
      .populate('attendance.member', 'name phone email');

    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    res.json({ success: true, meeting });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Record or Update meeting attendance
// @route   PUT /api/meetings/:id/attendance
// @access  Private (Admin or NHG Leaders)
router.put('/:id/attendance', async (req, res) => {
  const { attendanceRecords } = req.body; // Array of { memberId, status: 'present'|'absent' }

  if (!attendanceRecords || !Array.isArray(attendanceRecords)) {
    return res.status(400).json({ success: false, message: 'Please provide attendance records' });
  }

  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    // Check authority
    const nhg = await NHG.findById(meeting.nhg);
    const isAdmin = req.user.role === 'admin';
    const isLeader =
      nhg &&
      ((nhg.president && nhg.president.toString() === req.user.id) ||
        (nhg.secretary && nhg.secretary.toString() === req.user.id) ||
        (nhg.treasurer && nhg.treasurer.toString() === req.user.id));

    if (!isAdmin && !isLeader) {
      return res.status(403).json({ success: false, message: 'Not authorized to update attendance for this meeting' });
    }

    // Map records to meeting attendance schema structure
    meeting.attendance = attendanceRecords.map((rec) => ({
      member: rec.memberId,
      status: rec.status,
    }));

    await meeting.save();

    res.json({ success: true, message: 'Attendance updated successfully', meeting });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
