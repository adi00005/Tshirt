import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

// Load environment variables
dotenv.config();

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB...');

    // Check if test user already exists
    let user = await User.findOne({ email: 'test@example.com' });

    if (user) {
      console.log('Test user already exists. Updating password...');
      user.password = 'Test@1234';
      user.isActive = true;
      await user.save();
      console.log('Test user updated successfully!');
    } else {
      // Create test user
      user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test@1234',
        isActive: true,
        isAdmin: false
      });

      await user.save();
      console.log('Test user created successfully!');
    }

    // Verify password
    const isMatch = await bcrypt.compare('Test@1234', user.password);
    console.log('Password verification:', isMatch ? 'Success' : 'Failed');

    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
};

createTestUser();
