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
    min: [0, 'Savings amount cannot be negative'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
    default: 'Weekly Savings Deposit',
  },
});

module.exports = mongoose.model('Savings', SavingsSchema);
