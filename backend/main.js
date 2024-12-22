// server.js
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');


const corsOptions = {
  origin: true, // Replace with your allowed origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

const app = express();
app.use(cors(corsOptions));
app.use(cors());
app.use(express.json());

// MongoDB Models
const User = mongoose.model('User', {
  macAddress: { type: String, unique: true, required: true },
  isAuthenticated: { type: Boolean, default: false },
  playlist: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// Get all users (for admin panel)
app.get('/admin/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new user
app.post('/admin/users', async (req, res) => {
  try {
    const { macAddress, playlist } = req.body;
    const user = await User.create({
      macAddress,
      playlist,
      isAuthenticated: true
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user
app.put('/admin/users/:macAddress', async (req, res) => {
  try {
    const { macAddress } = req.params;
    const { playlist, isAuthenticated } = req.body;
    
    const user = await User.findOneAndUpdate(
      { macAddress },
      { playlist, isAuthenticated },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
app.delete('/admin/users/:macAddress', async (req, res) => {
  try {
    const { macAddress } = req.params;
    const user = await User.findOneAndDelete({ macAddress });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check MAC address authentication (for mobile app)
app.post('/check-auth', async (req, res) => {
  try {
    const { macAddress } = req.body;
    const user = await User.findOne({ macAddress });
    
    if (user && user.isAuthenticated) {
      const token = jwt.sign({ macAddress }, 'your-secret-key');
      res.json({ 
        isAuthenticated: true, 
        token,
        playlist: user.playlist 
      });
    } else {
      if (!user) {
        await User.create({ 
          macAddress, 
          isAuthenticated: false,
          playlist: ''
        });
      }
      res.json({ isAuthenticated: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's playlist (for mobile app)
app.get('/playlist/:macAddress', async (req, res) => {
  try {
    const { macAddress } = req.params;
    const user = await User.findOne({ macAddress });
    
    if (!user || !user.isAuthenticated) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    res.json({ playlist: user.playlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
/*
const PORT = process.env.PORT || 3000;
mongoose.connect('mongodb://localhost/streaming-app')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
  */
  const PORT = process.env.PORT || 3000;
  const mongoUri = 'mongodb+srv://ayoubouardaoui3:jI4QXcRmE2Fvzj6r@cluster0.topr3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  
  mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('Connected to MongoDB Atlas');
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.error('MongoDB connection error:', err));