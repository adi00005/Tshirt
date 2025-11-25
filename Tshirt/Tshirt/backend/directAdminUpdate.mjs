import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tshirt-shop', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  isAdmin: Boolean,
  isActive: Boolean,
  phone: String
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function updateAdmin() {
  try {
    const email = 'admin@example.com';
    const password = 'admin123';
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Update or create admin user
    const admin = await User.findOneAndUpdate(
      { email },
      {
        name: 'Admin User',
        email,
        password: hashedPassword,
        isAdmin: true,
        isActive: true,
        phone: '1234567890'
      },
      { 
        new: true,
        upsert: true,
        setDefaultsOnInsert: true 
      }
    );

    console.log('Admin user updated/created successfully!');
    console.log('Email:', admin.email);
    console.log('Password: admin123');
    console.log('isAdmin:', admin.isAdmin);
    console.log('isActive:', admin.isActive);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

updateAdmin();
