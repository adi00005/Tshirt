const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to check password
userSchema.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

const createTestUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tshirtstore');
    console.log('✅ Connected to MongoDB');

    // Clear existing users to avoid conflicts
    await User.deleteMany({});
    console.log('🗑️ Cleared existing users');

    // Create test users
    const users = [
      {
        username: 'testuser',
        email: 'test@test.com',
        password: 'test123',
        role: 'user'
      },
      {
        username: 'admin',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        username: 'user1',
        email: 'user1@test.com',
        password: '123456',
        role: 'user'
      }
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${userData.email} / ${userData.password}`);
    }

    console.log('\n🎉 Test users created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('1. Email: test@test.com | Password: test123');
    console.log('2. Email: admin@test.com | Password: admin123');
    console.log('3. Email: user1@test.com | Password: 123456');
    console.log('\n💡 You can also use usernames: testuser, admin, user1');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createTestUsers();
