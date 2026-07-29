const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const NHG = require('../models/NHG');
const { protect } = require('../middleware/auth');

const sendOTPEmail = async (email, otp) => {
  // Always log OTP in terminal as requested by user
  console.log('\n==========================================');
  console.log(`📨 [OTP VERIFICATION] TO: ${email}`);
  console.log(`🔑 SECURE 6-DIGIT OTP: ${otp}`);
  console.log('==========================================\n');

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
      port: process.env.EMAIL_PORT || 587,
      auth: {
        user: process.env.EMAIL_USER || '', // Configure in .env if using real account
        pass: process.env.EMAIL_PASS || '',
      },
    });

    const mailOptions = {
      from: '"Kudumbashree System" <no-reply@kudumbashree.org>',
      to: email,
      subject: 'Kudumbashree Registration - Email Verification OTP',
      text: `Your OTP for Kudumbashree Registration is ${otp}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #16a34a; text-align: center;">Kudumbashree System Verification</h2>
          <p>Thank you for registering. Please enter the following 6-digit verification code to complete your signup process:</p>
          <div style="font-size: 24px; font-weight: bold; text-align: center; padding: 15px; background: #f3f4f6; letter-spacing: 5px; margin: 20px 0; color: #111; border-radius: 4px;">
            ${otp}
          </div>
          <p style="color: #666; font-size: 12px; text-align: center;">This code will expire in 10 minutes. If you did not request this registration, please ignore this email.</p>
        </div>
      `,
    };

    if (!process.env.EMAIL_USER) {
      console.log('ℹ️ Nodemailer: No SMTP credentials in .env. Skipping real mail transfer (printed in console instead).');
      return true;
    }

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Nodemailer Error sending email:', error.message);
    return true;
  }
};

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret-key-12345', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, phone, role, nhgId, adminSecret } = req.body;

  try {
    // 1. Secret validations first
    let userRole = 'member';
    let assignedNhg = null;

    if (role === 'admin') {
      if (adminSecret !== 'KUDUMBA_ADMIN_2026') {
        return res.status(400).json({ success: false, message: 'Invalid Admin Secret Key' });
      }
      userRole = 'admin';
    } else {
      if (nhgId) {
        const nhgExists = await NHG.findById(nhgId);
        if (!nhgExists) {
          return res.status(404).json({ success: false, message: 'Selected NHG not found' });
        }
        assignedNhg = nhgId;
      }
    }

    // 2. Check duplicate / unverified user
    let user = await User.findOne({ email });
    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
      }
      
      // Update unverified user details
      user.name = name;
      user.password = password; // pre-save pre hook will hash password
      user.phone = phone;
      user.role = userRole;
      user.nhg = assignedNhg;
    } else {
      // Create new unverified user
      user = new User({
        name,
        email,
        password,
        phone,
        role: userRole,
        nhg: assignedNhg,
        isVerified: false,
      });
    }

    // 3. Generate and save OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    await user.save();

    // 4. Send verification email (logs to terminal)
    await sendOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: 'OTP verification code has been sent to your email. Please check your inbox or terminal console.',
      email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Verify registration OTP
// @route   POST /api/auth/verify-otp
// @access  Public
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Please provide email and verification code' });
  }

  try {
    const user = await User.findOne({ email }).populate('nhg', 'name code');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Account is already verified' });
    }

    // Check OTP and expiration
    if (user.otp !== otp || user.otpExpire < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
    }

    // Mark as verified
    user.isVerified = true;
    user.otp = null;
    user.otpExpire = null;
    
    // Set initial status
    let userStatus = 'pending';
    if (user.role === 'admin') {
      userStatus = 'approved'; // Admins are approved by default
    }
    user.status = userStatus;

    await user.save();

    // If member is registered with NHG, add user to NHG members array (now that they are verified)
    if (user.role === 'member' && user.nhg) {
      await NHG.findByIdAndUpdate(user.nhg._id, {
        $addToSet: { members: user._id },
      });
    }

    // Return token directly for approved users (Admins)
    if (userStatus === 'approved') {
      const token = generateToken(user._id);
      return res.status(200).json({
        success: true,
        message: 'Email verification successful! Welcome to the portal.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          nhg: user.nhg,
          savingsBalance: user.savingsBalance,
          walletBalance: user.walletBalance,
        },
      });
    } else {
      return res.status(200).json({
        success: true,
        message: 'Email verification successful! Your request is pending administrator approval.',
        status: 'pending',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  try {
    // Check for user
    const user = await User.findOne({ email }).select('+password').populate('nhg', 'name code');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Verify email verification state
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Your email address is not verified. Please verify using the OTP sent to your email during registration.',
        isVerified: false,
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // For members, verify approval status
    if (user.role === 'member' && user.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your registration is pending admin approval.',
        status: 'pending'
      });
    }

    if (user.role === 'member' && user.status === 'rejected') {
      return res.status(403).json({
        success: false,
        message: 'Your registration request has been rejected by the administrator.',
        status: 'rejected'
      });
    }

    // Create token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        nhg: user.nhg,
        savingsBalance: user.savingsBalance,
        walletBalance: user.walletBalance,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('nhg', 'name code location president secretary treasurer');
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
router.put('/update-profile', protect, async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (email) {
      // Check if email already taken
      const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
      user.email = email;
    }
    if (phone) user.phone = phone;
    if (password) user.password = password; // pre-save hook will hash it

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        nhg: user.nhg,
        savingsBalance: user.savingsBalance,
        walletBalance: user.walletBalance,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Get all active NHGs (used for registration dropdown)
// @route   GET /api/auth/nhgs
// @access  Public
router.get('/nhgs', async (req, res) => {
  try {
    const nhgs = await NHG.find({ status: 'active' }).select('name code location');
    res.status(200).json({
      success: true,
      nhgs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
