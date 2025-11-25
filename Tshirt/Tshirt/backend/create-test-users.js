// Create test user and admin accounts
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

const createTestUsers = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/tshirt_shop';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Create test regular user
    const testUserEmail = 'test@test.com';
    const existingUser = await User.findOne({ email: testUserEmail });
    
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const testUser = new User({
        name: 'Test User',
        email: testUserEmail,
        password: hashedPassword,
        isActive: true,
        isAdmin: false
      });
      
      await testUser.save();
      console.log('✅ Test user created:', testUserEmail);
    } else {
      console.log('ℹ️ Test user already exists:', testUserEmail);
    }

    // Create test admin user
    const adminEmail = 'admin@test.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const adminUser = new User({
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        isActive: true,
        isAdmin: true
      });
      
      await adminUser.save();
      console.log('✅ Admin user created:', adminEmail);
    } else {
      console.log('ℹ️ Admin user already exists:', adminEmail);
    }

    console.log('\n📋 Test Accounts Created:');
    console.log('Regular User:');
    console.log('  Email: test@test.com');
    console.log('  Password: password123');
    console.log('\nAdmin User:');
    console.log('  Email: admin@test.com');
    console.log('  Password: admin123');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createTestUsers();
