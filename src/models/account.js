const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['cash', 'debit', 'credit'],
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    validate: {
      validator: function (value) {
        if (this.type === 'cash' || this.type === 'debit') {
          return value != null;
        }
        return true;
      },
      message: (props) => `Balance is required for account type ${props.type}`
    }
  },
  limit: {
    type: Number,
    validate: {
      validator: function (value) {
        if (this.type === 'credit') {
          return value != null;
        }
        return true;
      },
      message: (props) => `Limit is required for account type ${props.type}`
    }
  },
  loan: {
    type: Number,
    validate: {
      validator: function (value) {
        if (this.type === 'credit') {
          return value != null;
        }
        return true;
      },
      message: (props) => `Loan is required for account type ${props.type}`
    }
  },
  statementDate: {
    type: Date,
    validate: {
      validator: function (value) {
        if (this.type === 'credit') {
          return value != null;
        }
        return true;
      },
      message: (props) => `Statement date is required for account type ${props.type}`
    }
  },
  statementDueDate: {
    type: Date,
    validate: {
      validator: function (value) {
        if (this.type === 'credit') {
          return value != null;
        }
        return true;
      },
      message: (props) => `Statement due date is required for account type ${props.type}`
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Account', accountSchema);
