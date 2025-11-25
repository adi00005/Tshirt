// Recreate admin user with proper debugging
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

const recreateAdminUser = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/tshirt_shop';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@test.com';
    const adminPassword = 'admin123';

    // Delete existing admin user
    await User.deleteOne({ email: adminEmail });
    console.log('Deleted existing admin user');

    // Create new admin user
    const adminUser = new User({
      name: 'Admin User',
      email: adminEmail,
      password: adminPassword, // Let the pre-save hook handle hashing
      isActive: true,
      isAdmin: true
    });

    await adminUser.save();
    console.log('✅ New admin user created');

    // Test the created user
    const createdUser = await User.findOne({ email: adminEmail }).select('+password');
    console.log('Password hash length:', createdUser.password.length);
    console.log('Password hash starts with $:', createdUser.password.startsWith('$'));
    console.log('Is admin:', createdUser.isAdmin);

    // Test password matching
    const isMatch = await createdUser.matchPassword(adminPassword);
    console.log('Password match result:', isMatch);

    console.log('\n📋 Admin Account:');
    console.log('Email: admin@test.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

recreateAdminUser();
