// scripts/checkMongoDirect.js
import { MongoClient } from 'mongodb';
import 'dotenv/config';

async function checkAdminUser() {
  const uri = process.env.MONGO_URI;
  const client = new MongoClient(uri);

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    const users = db.collection('users');
    
    // Check for admin user
    const adminUser = await users.findOne({
      $or: [
        { email: 'admin@tshirtstore.com' },
        { username: 'admin' },
        { role: 'admin' }
      ]
    });

    if (adminUser) {
      console.log('\n👤 Admin User Found:');
      console.log(`📧 Email: ${adminUser.email || 'Not set'}`);
      console.log(`👤 Username: ${adminUser.username || 'Not set'}`);
      console.log(`👑 Role: ${adminUser.role || 'Not set'}`);
      console.log(`✅ Active: ${adminUser.isActive !== false ? 'Yes' : 'No'}`);
      
      // If user exists but doesn't have admin role, update it
      if (adminUser.role !== 'admin') {
        console.log('\n⚠️  User found but does not have admin role. Updating to admin...');
        await users.updateOne(
          { _id: adminUser._id },
          { $set: { role: 'admin' } }
        );
        console.log('✅ Updated user role to admin');
      }
    } else {
      console.log('❌ No admin user found in the database');
      console.log('\nTo create an admin user, you can:');
      console.log('1. Sign up a new user through the frontend');
      console.log('2. Then update their role to "admin" in the database');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the function
checkAdminUser();
