// scripts/testAuth.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';

dotenv.config();

const testAuth = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Test password hashing and matching
    const testPassword = 'SecureAdmin@2025';
    const wrongPassword = 'wrongpassword';
    
    // Create a test user (won't be saved to DB)
    const testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: testPassword,
      role: 'admin',
      isActive: true
    });

    // Test 1: Check password hashing
    console.log('🧪 Testing password hashing...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testPassword, salt);
    console.log(`✅ Password hashed: ${hashedPassword.length > 10 ? 'Success' : 'Failed'}`);

    // Test 2: Check password matching with correct password
    const isMatch = await bcrypt.compare(testPassword, hashedPassword);
    console.log(`✅ Correct password match: ${isMatch ? 'Success' : 'Failed'}`);

    // Test 3: Check password matching with wrong password
    const isWrongMatch = await bcrypt.compare(wrongPassword, hashedPassword);
    console.log(`✅ Wrong password rejected: ${!isWrongMatch ? 'Success' : 'Failed'}`);

    // Test 4: Test the actual user method
    console.log('\n🧪 Testing User model methods...');
    const adminUser = await User.findOne({ email: 'admin@tshirtstore.com' });
    
    if (!adminUser) {
      console.error('❌ Admin user not found');
      return;
    }

    console.log(`👤 Found admin user: ${adminUser.email}`);
    console.log(`🔑 Hashed password: ${adminUser.password.substring(0, 20)}...`);
    
    // Test with correct password
    const adminMatch = await adminUser.matchPassword(testPassword);
    console.log(`✅ Admin password match: ${adminMatch ? 'Success' : 'Failed'}`);
    
    // Test with wrong password
    const adminWrongMatch = await adminUser.matchPassword(wrongPassword);
    console.log(`✅ Admin wrong password rejected: ${!adminWrongMatch ? 'Success' : 'Failed'}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.message.includes('Authentication failed')) {
      console.log('\n🔑 Authentication failed. This could be due to:');
      console.log('1. Incorrect MongoDB credentials in .env');
      console.log('2. MongoDB server not running');
      console.log('3. Network connectivity issues');
    }
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

testAuth();
