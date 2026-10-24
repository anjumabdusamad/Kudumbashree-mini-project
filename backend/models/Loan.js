const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Loan must belong to a member'],
  },
  nhg: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NHG',
    required: [true, 'Loan must belong to an NHG'],
  },
  amount: {
    type: Number,
    required: [true, 'Please add a loan amount'],
    min: [500, 'Loan amount must be at least ₹500'],
    max: [500000, 'Loan amount cannot exceed ₹5,00,000'],
  },
  purpose: {
    type: String,
    required: [true, 'Please state the purpose of the loan'],
    trim: true,
    minlength: [3, 'Purpose must be at least 3 characters long'],
    maxlength: [200, 'Purpose cannot exceed 200 characters'],
  },
  interestRate: {
    type: Number,
    default: 4, // 4% standard annual interest for Kudumbashree
  },
  durationMonths: {
    type: Number,
    required: [true, 'Please specify the loan duration in months'],
    min: [1, 'Loan duration must be at least 1 month'],
    max: [60, 'Loan duration cannot exceed 60 months'],
  },
  monthlyInstallment: {
    type: Number,
    required: true,
  },
  remainingAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'paid'],
    default: 'pending',
  },
  repayments: [
    {
      amount: { type: Number, required: true },
      date: { type: Date, default: Date.now },
      reference: { type: String, default: '' },
    },
  ],
  applicationDate: {
    type: Date,
    default: Date.now,
  },
  approvalDate: {
    type: Date,
  },
});

module.exports = mongoose.model('Loan', LoanSchema);
