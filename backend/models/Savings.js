const mongoose = require('mongoose');

const SavingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Savings must belong to a member'],
  },
  nhg: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NHG',
    required: [true, 'Savings must be associated with an NHG'],
  },
  amount: {
    type: Number,
    required: [true, 'Please add a savings amount'],
    min: [1, 'Savings amount must be at least ₹1'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
    default: 'Weekly Savings Deposit',
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters'],
  },
});

module.exports = mongoose.model('Savings', SavingsSchema);
