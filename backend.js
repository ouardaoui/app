// server.js
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Models
const User = mongoose.model('User', {
  macAddress: { type: String, unique: true, required: true },
  isAuthenticated: { type: Boolean, default: false },
  playlist: [{ type: String }],
});

const Admin = mongoose.model('Admin', {
  username: String,
  password: String,
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Check MAC address authentication
app.post('/check-auth', async (req, res) => {
  try {
    const { macAddress } = req.body;
    const user = await User.findOne({ macAddress });
    
    if (user && user.isAuthenticated) {
      const token = jwt.sign({ macAddress }, process.env.JWT_SECRET);
      res.json({ isAuthenticated: true, token });
    } else {
      if (!user) {
        await User.create({ macAddress, isAuthenticated: false });
      }
      res.json({ isAuthenticated: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's playlist
app.get('/playlist', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ macAddress: req.user.macAddress });
    res.json({ playlist: user.playlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Routes
app.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  
  if (admin && password === admin.password) {
    const token = jwt.sign({ username, isAdmin: true }, process.env.JWT_SECRET);
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/admin/authorize-user', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) return res.sendStatus(403);
  
  try {
    const { macAddress, playlist } = req.body;
    await User.findOneAndUpdate(
      { macAddress },
      { isAuthenticated: true, playlist },
      { new: true }
    );
    res.json({ message: 'User authorized successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

mongoose.connect(process.env.MONGODB_URI);
app.listen(3000, () => console.log('Server running on port 3000'));