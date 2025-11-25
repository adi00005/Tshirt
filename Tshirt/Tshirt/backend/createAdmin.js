import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

async function createAdmin() {
  try {
    // Check if MONGO_URI is set
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env file');
    }

    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Admin details
    const adminEmail = 'admin@tshirtstore.com';
    const adminPassword = 'admin123';

    // Check if admin exists
    let admin = await User.findOne({ email: adminEmail });
    
    if (admin) {
      console.log('ℹ️ Admin user already exists. Updating...');
      // Update existing admin with direct password hashing
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(adminPassword, salt);
      admin.isAdmin = true;
      admin.isActive = true;
      admin.phone = '1234567890';
      await admin.save({ validateBeforeSave: false });
      console.log('✅ Admin user updated successfully!');
    } else {
      // Create new admin with direct password hashing
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      admin = new User({
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true,
        isActive: true,
        phone: '1234567890',
        lastLogin: new Date()
      });
      
      await admin.save({ validateBeforeSave: false });
      console.log('✅ Admin user created successfully!');
    }

    console.log('\nAdmin Login Details:');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('\n⚠️ Please change this password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('\nPlease install required dependencies:');
      console.log('npm install mongoose dotenv bcryptjs');
    }
    process.exit(1);
  }
}

// Run the function
createAdmin();
