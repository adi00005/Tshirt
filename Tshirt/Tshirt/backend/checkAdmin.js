import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

async function checkAdmin() {
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Find admin user
    const admin = await mongoose.connection.db.collection('users').findOne({
      email: 'admin@tshirtstore.com'
    });

    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('\n🔍 Admin User Details:');
    console.log('Name:', admin.name);
    console.log('Email:', admin.email);
    console.log('isAdmin:', admin.isAdmin);
    console.log('isActive:', admin.isActive);
    console.log('Created At:', admin.createdAt);
    
    // Test password
    const isPasswordMatch = await bcrypt.compare('admin123', admin.password);
    console.log('\n🔑 Password Match Test:', isPasswordMatch ? '✅ Success' : '❌ Failed');
    
    if (!isPasswordMatch) {
      console.log('\n⚠️  The password in the database does not match "admin123"');
      console.log('Hashed Password in DB:', admin.password);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkAdmin();
