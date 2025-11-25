// scripts/checkAdmin.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config();

const checkAdmin = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Find admin user by email
    const admin = await User.findOne({ email: 'admin@tshirtstore.com' });
    
    if (!admin) {
      console.error('❌ Admin user not found');
      process.exit(1);
    }

    console.log('👤 Admin User Details:');
    console.log('======================');
    console.log(`ID: ${admin._id}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Username: ${admin.username || 'Not set'}`);
    console.log(`Role: ${admin.role}`);
    console.log(`Active: ${admin.isActive}`);
    console.log(`Created: ${admin.createdAt}`);
    console.log('\n✅ Check complete');

  } catch (error) {
    console.error('❌ Error checking admin:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

checkAdmin();
