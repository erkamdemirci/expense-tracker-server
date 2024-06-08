const mongoose = require('mongoose');

const currentAccountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: String,
  email: String,
  address: String,
  transfers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transfer'
    }
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('CurrentAccount', currentAccountSchema);
