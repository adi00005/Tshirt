// scripts/directReset.js
import { MongoClient } from 'mongodb';
import { hash } from 'bcryptjs';
import 'dotenv/config';

async function resetPassword() {
  const client = new MongoClient(process.env.MONGO_URI);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const users = db.collection('users');
    
    // New password
    const newPassword = 'admin123';
    const hashedPassword = await hash(newPassword, 10);
    
    // Update the admin user
    const result = await users.updateOne(
      { email: 'admin@tshirtstore.com' },
      { $set: { password: hashedPassword } }
    );
    
    if (result.matchedCount === 0) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Password reset successful!');
    console.log('📧 Email: admin@tshirtstore.com');
    console.log('🔑 New Password: ' + newPassword);
    console.log('⚠️  Please change this password after logging in!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

resetPassword();
