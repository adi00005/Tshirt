import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';

async function fixAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/tshirt-shop', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const email = 'admin@example.com';
    const password = 'admin123';
    let admin = await User.findOne({ email });

    if (admin) {
      console.log('Admin user found, updating...');
      admin.password = await bcrypt.hash(password, 10);
      admin.isAdmin = true;
      admin.isActive = true;
      await admin.save();
      console.log('Admin user updated successfully');
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      admin = new User({
        name: 'Admin User',
        email,
        password: hashedPassword,
        isAdmin: true,
        isActive: true
      });
      await admin.save();
      console.log('Admin user created successfully');
    }

    console.log('\nAdmin login details:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

fixAdmin();
