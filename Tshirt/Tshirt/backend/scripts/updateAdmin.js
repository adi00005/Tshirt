// scripts/updateAdmin.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config();

const ADMIN_EMAIL = 'admin@tshirtstore.com';
const NEW_PASSWORD = 'SecureAdmin@2025'; // New secure password

const updateAdmin = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ email: ADMIN_EMAIL });
    
    if (!admin) {
      console.error('❌ Admin user not found');
      process.exit(1);
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(NEW_PASSWORD, salt);
    await admin.save();
    
    console.log('\n✨ Admin Password Updated');
    console.log('======================');
    console.log(`📧 Email: ${ADMIN_EMAIL}`);
    console.log(`🔑 New Password: ${NEW_PASSWORD}`);
    console.log('\n✅ Password has been updated successfully');
    
  } catch (error) {
    console.error('❌ Error updating admin:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Run the update
updateAdmin();
