import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import fs from 'fs';

dotenv.config();

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    // Read test user data
    const testUser = JSON.parse(fs.readFileSync('./test-user.json', 'utf-8'));
    
    // Remove if user exists
    await User.deleteOne({ email: testUser.email });

    // Create new user (password will be hashed by pre-save hook)
    const user = await User.create(testUser);

    console.log('✅ Test user created:');
    console.log(`Email: ${user.email}`);
    console.log(`Password: ${testUser.password}`);
    console.log('isActive:', user.isActive);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestUser();
