import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

// Load environment variables
dotenv.config();

const checkTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB...');

    // Find test user
    const user = await User.findOne({ email: 'test@example.com' }).select('+password');
    
    if (!user) {
      console.log('Test user not found');
      process.exit(1);
    }

    console.log('Test user found:');
    console.log({
      _id: user._id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      isAdmin: user.isAdmin,
      password: user.password ? '*** hashed ***' : 'No password set',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });

    // Verify password
    const isMatch = await user.matchPassword('Test@1234');
    console.log('Password verification:', isMatch ? '✅ Success' : '❌ Failed');

    process.exit(0);
  } catch (error) {
    console.error('Error checking test user:', error);
    process.exit(1);
  }
};

checkTestUser();
