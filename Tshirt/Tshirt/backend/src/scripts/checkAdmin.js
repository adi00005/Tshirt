// Simple script to check admin user in MongoDB
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get the User model
    const User = (await import('../models/User.js')).default;
    
    // Check for admin user
    const admin = await User.findOne({ 
      $or: [
        { email: 'admin@tshirtstore.com' },
        { username: 'admin' },
        { role: 'admin' }
      ]
    });

    if (admin) {
      console.log('\n👤 Admin User Found:');
      console.log(`📧 Email: ${admin.email}`);
      console.log(`👤 Username: ${admin.username}`);
      console.log(`👑 Role: ${admin.role}`);
      console.log(`✅ Active: ${admin.isActive ? 'Yes' : 'No'}`);
    } else {
      console.log('❌ No admin user found in the database');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run the function
checkAdmin();
