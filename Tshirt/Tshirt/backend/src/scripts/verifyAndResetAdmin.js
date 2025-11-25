// src/scripts/verifyAndResetAdmin.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

// Admin credentials
const ADMIN_EMAIL = 'admin@tshirtstore.com';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

async function verifyAndResetAdmin() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin exists
    console.log('🔍 Checking for admin user...');
    let admin = await User.findOne({ 
      $or: [
        { email: ADMIN_EMAIL },
        { username: ADMIN_USERNAME }
      ]
    });

    if (!admin) {
      console.log('❌ Admin user not found. Creating new admin user...');
      // Create new admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
      
      admin = new User({
        username: ADMIN_USERNAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        fullName: 'System Administrator'
      });
      
      await admin.save();
      console.log('✅ Created new admin user');
    } else {
      console.log('ℹ️  Admin user found. Resetting password...');
      // Reset password
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(ADMIN_PASSWORD, salt);
      admin.role = 'admin';
      admin.isActive = true;
      await admin.save();
      console.log('✅ Reset admin password');
    }

    console.log('\n👤 Admin Details:');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`👤 Username: ${admin.username}`);
    console.log(`🔑 Password: ${ADMIN_PASSWORD} (default)`);
    console.log(`👑 Role: ${admin.role}`);
    console.log(`✅ Active: ${admin.isActive ? 'Yes' : 'No'}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run the function
verifyAndResetAdmin();
