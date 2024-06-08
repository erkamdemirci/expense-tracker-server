const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  ledger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ledger',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  }
});

// const transfer = {
//   "title": "Salary",
//   "description": "Monthly salary",
//   "amount": 5000,
//   "category": "5f7f7e8d5b4c6d0017b2d7b5",
//   "date": "2020-10-08T00:00:00.000Z",
//   "type": "income",
//   "ledger": "5f7f7e8d5b4c6d0017b2d7b5",
//   "status": "pending",
//   "from": "5f7f7e8d5b4c6d0017b2d7b5",
//   "to": "5f7f7e8d5b4c6d0017b2d7b5",
//   "createdBy": "5f7f7e8d5b4c6d0017b2d7b5",
//   "updatedBy": "5f7f7e8d5b4c6d0017b2d7b5",
//   "deletedBy": "5f7f7e8d5b4c6d0017b2d7b5",
//   "createdAt": "2020-10-08T00:00:00.000Z"
// }

module.exports = mongoose.model('Transfer', transferSchema);
