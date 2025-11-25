import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    const admin = new User({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin123',
      isAdmin: true,
      isActive: true
    });

    await admin.save();
    console.log('Admin user created:', admin);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
