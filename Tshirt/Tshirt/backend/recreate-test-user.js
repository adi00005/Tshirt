// Recreate test user with proper debugging
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import User model
import User from './src/models/User.js';

const recreateTestUser = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/tshirt_shop';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    const testEmail = 'test@test.com';
    const testPassword = 'password123';

    // Delete existing test user
    await User.deleteOne({ email: testEmail });
    console.log('Deleted existing test user');

    // Create new test user
    const testUser = new User({
      name: 'Test User',
      email: testEmail,
      password: testPassword, // Let the pre-save hook handle hashing
      isActive: true,
      isAdmin: false
    });

    await testUser.save();
    console.log('✅ New test user created');

    // Test the created user
    const createdUser = await User.findOne({ email: testEmail }).select('+password');
    console.log('Password hash length:', createdUser.password.length);
    console.log('Password hash starts with $:', createdUser.password.startsWith('$'));

    // Test password matching
    const isMatch = await createdUser.matchPassword(testPassword);
    console.log('Password match result:', isMatch);

    console.log('\n📋 Test Account:');
    console.log('Email: test@test.com');
    console.log('Password: password123');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

recreateTestUser();
