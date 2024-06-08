const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');

const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');
const authRoutes = require('./routes/auth');
const auditRoutes = require('./routes/audit');
const transferRoutes = require('./routes/transfer');

dotenv.config();

const app = express();
app.use(cors());

app.use(bodyParser.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

app.use('/api/category', categoryRoutes);
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/transfer', transferRoutes);

module.exports = app;
