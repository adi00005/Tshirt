import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tshirtstore')
  .then(async () => {
    console.log('Connected to MongoDB');
    const User = await import('./src/models/User.js');
    
    const users = await User.default.find({});
    console.log('Total users:', users.length);
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Admin: ${user.isAdmin} - Active: ${user.isActive}`);
    });
    
    mongoose.connection.close();
  })
  .catch(err => console.error('MongoDB connection error:', err));
