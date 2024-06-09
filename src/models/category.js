const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  goal: {
    type: Number
  },
  subcategories: [
    {
      name: {
        type: String,
        required: true
      },
      icon: {
        type: String,
        required: true
      },
      color: {
        type: String,
        required: true
      }
    }
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ledger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ledger',
    required: true
  }
});

module.exports = mongoose.model('Category', categorySchema);
