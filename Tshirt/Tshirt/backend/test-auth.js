// test-auth.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User.js';

dotenv.config();

async function testAuth() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Test user credentials
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'test1234',
      isActive: true
    };

    // Clean up any existing test user
    await User.deleteOne({ email: testUser.email });

    // Create test user
    const user = await User.create(testUser);
    console.log('Created test user:', user.email);

    // Test login
    const foundUser = await User.findOne({ email: testUser.email }).select('+password');
    const isMatch = await bcrypt.compare(testUser.password, foundUser.password);
    
    if (isMatch) {
      console.log('✅ Password matches!');
      const token = jwt.sign(
        { id: foundUser._id, isAdmin: foundUser.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );
      console.log('✅ Token generated successfully!');
      console.log('Test passed!');
    } else {
      console.log('❌ Password does not match!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testAuth();
