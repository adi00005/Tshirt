import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async function() {
  console.log('Connected to MongoDB');
  
  const User = (await import('./src/models/User.js')).default;
  
  try {
    // Check if admin exists
    const admin = await User.findOne({ email: 'admin@tshirtstore.com' });
    
    if (!admin) {
      // Create admin user
      const newAdmin = new User({
        name: 'Admin',
        email: 'admin@tshirtstore.com',
        password: 'admin123',
        isAdmin: true,
        isActive: true,
        phone: '1234567890'
      });
      
      // Save the admin user
      await newAdmin.save();
      console.log(' Admin user created successfully!');
      console.log('Email: admin@tshirtstore.com');
      console.log('Password: admin123');
    } else {
      console.log(' Admin user already exists');
      // Update password if needed
      admin.password = 'admin123';
      admin.isAdmin = true;
      admin.isActive = true;
      await admin.save();
      console.log(' Admin user updated with default password');
      console.log('Email: admin@tshirtstore.com');
      console.log('Password: admin123');
    }
    
    process.exit(0);
  } catch (error) {
    console.error(' Error:', error);
    process.exit(1);
  }
});
