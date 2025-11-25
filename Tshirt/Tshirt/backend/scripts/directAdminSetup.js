// scripts/directAdminSetup.js
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setupAdmin() {
  const client = new MongoClient(process.env.MONGO_URI);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const users = db.collection('users');
    
    // Admin user details
    const adminUser = {
      username: 'admin',
      email: 'admin@tshirtstore.com',
      password: await bcrypt.hash('admin123', 10), // Hashed password
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Check if admin already exists
    const existingAdmin = await users.findOne({ 
      $or: [
        { email: adminUser.email },
        { username: adminUser.username },
        { role: 'admin' }
      ]
    });

    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Username:', existingAdmin.username);
      
      // Update existing admin
      await users.updateOne(
        { _id: existingAdmin._id },
        { 
          $set: { 
            ...adminUser,
            _id: existingAdmin._id // Preserve the existing _id
          } 
        }
      );
      console.log('✅ Updated existing admin user');
    } else {
      // Create new admin
      await users.insertOne(adminUser);
      console.log('✅ Created new admin user');
    }
    
    console.log('\n🔑 Admin Credentials:');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Username:', adminUser.username);
    console.log('🔑 Password: admin123');
    console.log('\n⚠️  IMPORTANT: Change this password after first login!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the setup
setupAdmin();
