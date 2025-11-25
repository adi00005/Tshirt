// scripts/setupAdmin.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { logInfo, logError, logSuccess } from '../src/utils/logger.js';
import User from '../src/models/User.js';

// Load environment variables
dotenv.config();

// Admin user configuration
const ADMIN_CONFIG = {
  name: 'Admin User',
  email: process.env.ADMIN_EMAIL || 'admin@tshirtshop.com',
  password: process.env.ADMIN_PASSWORD || 'Admin@123',
  role: 'admin',
  isActive: true,
  emailVerified: true,
};

/**
 * Connect to MongoDB
 */
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logInfo('Connected to MongoDB');
  } catch (error) {
    logError('MongoDB connection error:', error);
    process.exit(1);
  }
}

/**
 * Create or update admin user
 */
async function setupAdmin() {
  try {
    // Check if admin already exists
    let admin = await User.findOne({ email: ADMIN_CONFIG.email });
    
    if (admin) {
      // Update existing admin
      admin.role = 'admin';
      admin.isActive = true;
      admin.emailVerified = true;
      
      // Update password if it's the default one
      if (ADMIN_CONFIG.password && ADMIN_CONFIG.password !== 'Admin@123') {
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(ADMIN_CONFIG.password, salt);
      }
      
      await admin.save();
      logSuccess(`Admin user ${ADMIN_CONFIG.email} updated successfully`);
    } else {
      // Create new admin
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_CONFIG.password, salt);
      
      admin = new User({
        name: ADMIN_CONFIG.name,
        email: ADMIN_CONFIG.email,
        password: hashedPassword,
        role: ADMIN_CONFIG.role,
        isActive: ADMIN_CONFIG.isActive,
        emailVerified: ADMIN_CONFIG.emailVerified,
      });
      
      await admin.save();
      logSuccess(`Admin user ${ADMIN_CONFIG.email} created successfully`);
    }
    
    logInfo('Admin setup completed');
    process.exit(0);
  } catch (error) {
    logError('Error setting up admin:', error);
    process.exit(1);
  }
}

// Run the setup
(async () => {
  try {
    await connectDB();
    await setupAdmin();
  } catch (error) {
    logError('Setup failed:', error);
    process.exit(1);
  } finally {
    mongoose.connection.close();
  }
})();
