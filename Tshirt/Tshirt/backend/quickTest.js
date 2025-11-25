// Quick test to create user and start server
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

// Auth routes
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    
    const user = await User.findOne({
      $or: [
        { username: new RegExp(`^${usernameOrEmail}$`, "i") },
        { email: usernameOrEmail.toLowerCase() }
      ]
    });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = 'test-token-' + Date.now();
    
    res.json({ 
      message: "Signin successful", 
      token: token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Start server and create test user
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tshirtstore');
    console.log('✅ MongoDB Connected');

    // Create test user if doesn't exist
    const existingUser = await User.findOne({ email: 'test@test.com' });
    if (!existingUser) {
      const testUser = new User({
        username: 'testuser',
        email: 'test@test.com',
        password: 'test123'
      });
      await testUser.save();
      console.log('✅ Test user created: test@test.com / test123');
    } else {
      console.log('👤 Test user exists: test@test.com / test123');
    }

    app.listen(4999, () => {
      console.log('🚀 Server running on port 4999');
      console.log('🔑 Test login: test@test.com / test123');
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

startServer();
