import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

// Load environment variables
dotenv.config();

const checkDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGO_URI);
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📂 Collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    // Count users
    const userCount = await User.countDocuments();
    console.log(`\n👥 Total users: ${userCount}`);

    // List all users (without sensitive data)
    if (userCount > 0) {
      console.log('\n📋 User list:');
      const users = await User.find({}).select('name email isActive isAdmin createdAt');
      console.log(users);
    }

    // Check test user
    console.log('\n🔍 Checking test user...');
    const testUser = await User.findOne({ email: 'test@example.com' }).select('+password');
    
    if (testUser) {
      console.log('✅ Test user found:');
      console.log({
        _id: testUser._id,
        name: testUser.name,
        email: testUser.email,
        isActive: testUser.isActive,
        isAdmin: testUser.isAdmin,
        password: testUser.password ? '*** hashed ***' : 'No password set',
        createdAt: testUser.createdAt,
        updatedAt: testUser.updatedAt
      });

      // Verify password
      const isMatch = await testUser.matchPassword('Test@1234');
      console.log('🔑 Password verification:', isMatch ? '✅ Success' : '❌ Failed');
    } else {
      console.log('❌ Test user not found');
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

checkDatabase();
