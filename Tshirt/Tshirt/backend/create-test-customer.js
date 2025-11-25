import mongoose from 'mongoose';
import { config } from 'dotenv';
import bcrypt from 'bcryptjs';

config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tshirtstore')
  .then(async () => {
    console.log('Connected to MongoDB');
    const User = await import('./src/models/User.js');
    
    // Create a test customer user
    const customerUser = {
      name: 'Manoj Kendri',
      email: 'manukendri7@gmail.com',
      password: 'password123',
      isAdmin: false,
      isActive: true
    };
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    customerUser.password = await bcrypt.hash(customerUser.password, salt);
    
    // Check if user already exists
    const existingUser = await User.default.findOne({ email: customerUser.email });
    if (existingUser) {
      console.log('User already exists:', existingUser.email);
    } else {
      // Create user
      const user = await User.default.create(customerUser);
      console.log('Created customer user:', user.email);
    }
    
    // Create a test admin user if not exists
    const adminUser = {
      name: 'Admin User',
      email: 'admin@tshirtstore.com',
      password: 'admin123',
      isAdmin: true,
      isActive: true
    };
    
    const adminSalt = await bcrypt.genSalt(10);
    adminUser.password = await bcrypt.hash(adminUser.password, adminSalt);
    
    const existingAdmin = await User.default.findOne({ email: adminUser.email });
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);
    } else {
      const admin = await User.default.create(adminUser);
      console.log('Created admin user:', admin.email);
    }
    
    // List all users
    const users = await User.default.find({});
    console.log('\nTotal users:', users.length);
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Admin: ${user.isAdmin} - Active: ${user.isActive}`);
    });
    
    mongoose.connection.close();
  })
  .catch(err => console.error('Error:', err));
