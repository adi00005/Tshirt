import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'test1234',
      isActive: true
    };

    // Remove if user exists
    await User.deleteOne({ email: testUser.email });

    // Create new user
    const user = await User.create(testUser);
    console.log('Test user created:', {
      email: user.email,
      password: 'test1234' // This is the plain password for testing
    });

    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser();
