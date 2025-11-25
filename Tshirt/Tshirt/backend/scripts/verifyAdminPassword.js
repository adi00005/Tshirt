// scripts/verifyAdminPassword.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';

dotenv.config();

const verifyAdminPassword = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Get admin user
    const adminEmail = 'admin@tshirtstore.com';
    const adminUser = await User.findOne({ email: adminEmail });
    
    if (!adminUser) {
      console.error('❌ Admin user not found in the database');
      return;
    }

    console.log('👤 Admin User Details:');
    console.log(`- Email: ${adminUser.email}`);
    console.log(`- Role: ${adminUser.role}`);
    console.log(`- Active: ${adminUser.isActive}`);
    console.log(`- Password Hash: ${adminUser.password.substring(0, 10)}...`);
    console.log('');

    // Test password matching
    const testPasswords = [
      'SecureAdmin@2025',
      'admin123',
      'password',
      'admin',
      'admin@123',
      'admin123!',
      'Admin@123',
      'Admin123',
      'admin@1234',
      'Admin@1234'
    ];

    console.log('🔑 Testing password matching...');
    let found = false;
    
    for (const password of testPasswords) {
      const isMatch = await adminUser.matchPassword(password);
      console.log(`- Testing "${password}": ${isMatch ? '✅ MATCH' : '❌ no match'}`);
      
      if (isMatch) {
        console.log('\n🎉 Found matching password!');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: "${password}"`);
        found = true;
        break;
      }
    }

    if (!found) {
      console.log('\n❌ None of the test passwords matched.');
      console.log('   Try running the updateAdmin.js script to reset the password:');
      console.log('   $ node scripts/updateAdmin.js');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

verifyAdminPassword();
