import mongoose from 'mongoose';
import { config } from 'dotenv';
import bcrypt from 'bcryptjs';

config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tshirtstore')
  .then(async () => {
    console.log('Connected to MongoDB');
    const User = await import('./src/models/User.js');
    
    // Get customer user
    const customer = await User.default.findOne({ email: 'manukendri7@gmail.com' });
    
    if (customer) {
      console.log('Customer password hash length:', customer.password.length);
      console.log('Password hash starts with:', customer.password.substring(0, 10));
      
      // Test manual bcrypt compare
      const manualCompare = await bcrypt.compare('password123', customer.password);
      console.log('Manual bcrypt compare result:', manualCompare);
      
      // Create a new hash to test
      const testHash = await bcrypt.hash('password123', 10);
      console.log('New hash length:', testHash.length);
      console.log('New hash starts with:', testHash.substring(0, 10));
      
      const testCompare = await bcrypt.compare('password123', testHash);
      console.log('Test hash compare result:', testCompare);
    }
    
    mongoose.connection.close();
  })
  .catch(err => console.error('Error:', err));
