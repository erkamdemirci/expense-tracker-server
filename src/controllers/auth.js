// controllers/authController.js
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { customAlphabet } = require('nanoid');
const createAuditLog = require('../utils/auditLog');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

const generateUniqueUsername = async () => {
  const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);
  let username;
  let userExists;

  do {
    username = nanoid();
    userExists = await User.findOne({ username });
  } while (userExists);

  return username;
};

exports.signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    const username = await generateUniqueUsername();
    const user = new User({ email, password, username });
    await user.save();
    const token = generateToken(user._id);

    await createAuditLog(user._id, 'signup', `User signed up with email: ${email}`);

    try {
      const newLedger = new Ledger({
        name: 'Kişisel Defterim',
        currency: 'TRY',
        balance: 0,
        type: 'personal',
        users: [user._id],
        createdBy: user._id
      });
      await newLedger.save();
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Failed to create ledger', error: error.message });
    }

    res.status(201).json({ token, user });
  } catch (error) {
    console.log(error);
    console.log(error);
    res.status(400).json({ error: 'Email already exists' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = generateToken(user._id);

    // Create audit log for login
    await createAuditLog(user._id, 'login', `User logged in with email: ${email}`);

    // Return token and user details without password
    const _user = user.toObject();
    delete _user.password;
    res.json({ token, user: _user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.googleLogin = async (req, res) => {
  const { googleId, email } = req.body;
  try {
    let user = await User.findOne({ googleId });
    if (!user) {
      const username = await generateUniqueUsername();
      user = new User({ googleId, email, username });
      await user.save();
    }
    const token = generateToken(user._id);
    res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
