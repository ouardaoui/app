require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// MongoDB Models
const Admin = mongoose.model('Admin', {
  username: String,
  password: String,
  isAdmin: { type: Boolean, default: true }
});

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb+srv://ayoubouardaoui3:jI4QXcRmE2Fvzj6r@cluster0.topr3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const addAdmin = async (username, password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ username, password: hashedPassword,isAdmin: true });
    await admin.save();
    console.log('Admin user added successfully');
  } catch (error) {
    console.error('Error adding admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Replace 'adminUsername' and 'adminPassword' with the desired admin credentials
addAdmin('admin1', '1234');