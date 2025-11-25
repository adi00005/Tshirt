import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connected...');

    // Check if admin exists
    const adminExists = await User.findOne({ email: 'admin@tshirtstore.com' });

    if (!adminExists) {
      // Create admin user
      const admin = await User.create({
        name: 'Admin',
        email: 'admin@tshirtstore.com',
        password: 'admin123',
        isAdmin: true,
        isActive: true, // Mark as active to skip OTP verification
        phone: '1234567890'
      });

      console.log('Admin user created successfully:', {
        email: admin.email,
        isAdmin: admin.isAdmin,
        isActive: admin.isActive
      });
    } else {
      console.log('Admin user already exists');
      
      // Update admin password if it was changed
      if (!(await adminExists.matchPassword('admin123'))) {
        adminExists.password = 'admin123';
        await adminExists.save();
        console.log('Admin password reset to default');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin();
