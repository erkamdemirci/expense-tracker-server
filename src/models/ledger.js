const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  type: {
    type: String,
    enum: ['personal', 'joint'],
    required: true
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  incomes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transfer'
    }
  ],
  expenses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transfer'
    }
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Ledger', ledgerSchema);
