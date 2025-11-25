import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tshirtstore')
  .then(async () => {
    console.log('Connected to MongoDB');
    const User = await import('./src/models/User.js');
    
    // Test customer login
    const customer = await User.default.findOne({ email: 'manukendri7@gmail.com' }).select('+password');
    
    if (customer) {
      console.log('Customer found:', customer.email);
      console.log('Is admin:', customer.isAdmin);
      console.log('Is active:', customer.isActive);
      
      // Test password match
      const isMatch = await customer.matchPassword('password123');
      console.log('Password match (password123):', isMatch);
      
      // Test wrong password
      const isWrongMatch = await customer.matchPassword('wrongpassword');
      console.log('Password match (wrongpassword):', isWrongMatch);
    } else {
      console.log('Customer not found');
    }
    
    // Test admin login
    const admin = await User.default.findOne({ email: 'admin@tshirtstore.com' }).select('+password');
    
    if (admin) {
      console.log('\nAdmin found:', admin.email);
      console.log('Is admin:', admin.isAdmin);
      console.log('Is active:', admin.isActive);
      
      // Test password match
      const isMatch = await admin.matchPassword('admin123');
      console.log('Password match (admin123):', isMatch);
    } else {
      console.log('Admin not found');
    }
    
    mongoose.connection.close();
  })
  .catch(err => console.error('Error:', err));
