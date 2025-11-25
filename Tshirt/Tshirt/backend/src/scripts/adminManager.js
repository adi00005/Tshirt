#!/usr/bin/env node

import dotenv from "dotenv";
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { program } from 'commander';
import User from "../models/User.js";

// Load environment variables
dotenv.config();

// Default admin credentials
const DEFAULT_ADMIN = {
  name: 'Admin User',
  email: 'admin@tshirtstore.com',
  password: 'Admin@123', // Stronger default password
  isAdmin: true,
  isActive: true
};

// Password requirements
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireNumber: true,
  requireSpecialChar: true
};

// Connect to MongoDB
async function connectDB() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return false;
  }
}

// Disconnect from MongoDB
async function disconnectDB() {
  try {
    if (mongoose.connection.readyState !== 0) { // 0 = disconnected
      await mongoose.disconnect();
      console.log('✅ Disconnected from MongoDB');
    }
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error.message);
  }
}

// Validate password strength
function validatePassword(password) {
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    return `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`;
  }
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (PASSWORD_REQUIREMENTS.requireNumber && !/\d/.test(password)) {
    return 'Password must contain at least one number';
  }
  if (PASSWORD_REQUIREMENTS.requireSpecialChar && !/[^A-Za-z0-9]/.test(password)) {
    return 'Password must contain at least one special character';
  }
  return null;
}

// Hash password
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// Create or update admin user
async function manageAdmin(options) {
  const { email, name, password, reset, deactivate } = options;
  
  if (!await connectDB()) return;

  try {
    const adminEmail = email || DEFAULT_ADMIN.email;
    const adminPassword = password || (reset ? null : DEFAULT_ADMIN.password);
    
    if (!adminPassword && !deactivate) {
      console.error('❌ Error: Password is required when not deactivating');
      return;
    }

    // Check if admin exists
    let admin = await User.findOne({ email: adminEmail });

    if (admin && !reset && !deactivate) {
      console.log('ℹ️  Admin user already exists. Use --reset to update password or --deactivate to disable.');
      return;
    }

    // Handle deactivation
    if (deactivate) {
      if (!admin) {
        console.error(`❌ Error: Admin user ${adminEmail} not found`);
        return;
      }
      admin.isActive = false;
      await admin.save();
      console.log(`✅ Admin user ${adminEmail} has been deactivated`);
      return;
    }

    // Validate password if provided
    if (adminPassword) {
      const passwordError = validatePassword(adminPassword);
      if (passwordError) {
        console.error(`❌ ${passwordError}`);
        return;
      }
    }

    // Prepare admin data
    const adminData = {
      name: name || admin?.name || DEFAULT_ADMIN.name,
      email: adminEmail,
      password: await hashPassword(adminPassword),
      isAdmin: true,
      isActive: true
    };

    if (!admin) {
      // Create new admin
      admin = new User(adminData);
    } else {
      // Update existing admin
      Object.assign(admin, adminData);
    }

    // Save the admin user
    await admin.save();
    console.log(`\n✅ Admin user ${admin.email} has been ${reset ? 'updated' : 'created'} successfully`);
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🟢 Status: Active`);
    
  } catch (error) {
    console.error('❌ Error managing admin user:', error.message);
    if (error.errors) {
      Object.values(error.errors).forEach(err => {
        console.error(`   - ${err.message}`);
      });
    }
  } finally {
    await disconnectDB();
  }
}

// List all admin users
async function listAdmins() {
  if (!await connectDB()) return;

  try {
    const admins = await User.find({ isAdmin: true })
      .select('name email isActive lastLogin createdAt')
      .sort({ isActive: -1, createdAt: -1 });

    if (admins.length === 0) {
      console.log('No admin users found.');
      return;
    }

    console.log('\n👥 Admin Users:');
    console.log(''.padEnd(60, '-'));
    
    admins.forEach((admin) => {
      console.log(`
  👤 ${admin.name}`);
      console.log('  ' + ''.padEnd(40, '─'));
      console.log(`  📧 ${admin.email}`);
      console.log(`  📅 Created: ${admin.createdAt.toLocaleString()}`);
      console.log(`  🔒 Status: ${admin.isActive ? '🟢 Active' : '🔴 Inactive'}`);
      if (admin.lastLogin) {
        console.log(`  🔄 Last Login: ${new Date(admin.lastLogin).toLocaleString()}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error listing admin users:', error.message);
  } finally {
    await disconnectDB();
  }
}

// Set up CLI commands
program
  .name('admin-manager')
  .description('CLI tool to manage admin users')
  .version('1.1.0');

program
  .command('create')
  .description('Create or update an admin user')
  .option('-e, --email <email>', 'Admin email')
  .option('-n, --name <name>', 'Admin full name')
  .option('-p, --password <password>', 'Admin password (min 8 chars, 1 uppercase, 1 number, 1 special char)')
  .option('-r, --reset', 'Reset password if user exists')
  .option('-d, --deactivate', 'Deactivate the admin user')
  .action((options) => {
    if (!options.email && !options.reset && !options.deactivate) {
      console.log('\nℹ️  No email provided. Using default admin email.');
    }
    manageAdmin(options);
  });

program
  .command('list')
  .description('List all admin users')
  .action(() => {
    listAdmins();
  });

// Show help if no arguments provided
if (process.argv.length <= 2) {
  program.help();
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error.message);
  process.exit(1);
});

// Parse command line arguments
program.parse(process.argv);
