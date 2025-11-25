// Debug authentication test
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import User model
import User from './src/models/User.js';

const debugAuth = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/tshirt_shop';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    const testEmail = 'test@test.com';
    const testPassword = 'password123';

    // Find user
    const user = await User.findOne({ email: testEmail }).select('+password');
    console.log('User found:', user ? 'YES' : 'NO');
    
    if (user) {
      console.log('User details:');
      console.log('  Email:', user.email);
      console.log('  Name:', user.name);
      console.log('  isActive:', user.isActive);
      console.log('  isAdmin:', user.isAdmin);
      console.log('  Password hash exists:', user.password ? 'YES' : 'NO');
      
      // Test password matching
      console.log('\nTesting password matching...');
      const isMatch = await user.matchPassword(testPassword);
      console.log('Password match result:', isMatch);
      
      // Test with wrong password
      const wrongMatch = await user.matchPassword('wrongpassword');
      console.log('Wrong password match result:', wrongMatch);
      
      // Manual bcrypt comparison
      console.log('\nManual bcrypt test...');
      const manualMatch = await bcrypt.compare(testPassword, user.password);
      console.log('Manual bcrypt match result:', manualMatch);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

debugAuth();
