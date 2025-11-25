import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

// Load environment variables
dotenv.config();

const listUsers = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGO_URI);
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');
    
    // List all users
    const users = await User.find({}).select('name email isActive isAdmin createdAt');
    console.log('\n📋 Users in database:');
    console.log(users);

    // Check if test user exists
    const testUser = await User.findOne({ email: 'test@example.com' });
    if (testUser) {
      console.log('\n✅ Test user exists:', testUser.email);
    } else {
      console.log('\n❌ Test user not found');
      console.log('\nTo create a test user, run:');
      console.log('node scripts/createTestUser.js');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n🔴 MongoDB connection refused. Please ensure MongoDB is running.');
      console.log('\nTo start MongoDB on Windows:');
      console.log('1. Open Command Prompt as Administrator');
      console.log('2. Run: net start MongoDB');
    }
    process.exit(1);
  }
};

listUsers();
