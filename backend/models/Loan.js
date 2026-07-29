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
  },
  purpose: {
    type: String,
    required: [true, 'Please state the purpose of the loan'],
  },
  interestRate: {
    type: Number,
    default: 4, // 4% standard annual interest for Kudumbashree
  },
  durationMonths: {
    type: Number,
    required: [true, 'Please specify the loan duration in months'],
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
