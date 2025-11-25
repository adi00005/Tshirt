const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// In-memory users for testing (fallback when MongoDB is not available)
const testUsers = [
  {
    id: '1',
    username: 'testuser',
    email: 'test@test.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO8G', // test123
    role: 'user'
  },
  {
    id: '2', 
    username: 'admin',
    email: 'admin@test.com',
    password: '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
    role: 'admin'
  },
  {
    id: '3',
    username: 'user1',
    email: 'user1@test.com', 
    password: '$2a$12$6mzADCKSsu9.QV8qtqjd2eX8QJmntXF5Oe5v.8n5rOJ5Kzb5Kzb5K', // 123456
    role: 'user'
  }
];

// Auth endpoints
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { usernameOrEmail, password, remember } = req.body;
    
    console.log('Login attempt:', { usernameOrEmail, remember });
    
    // Find user by username or email
    const user = testUsers.find(u => 
      u.username.toLowerCase() === usernameOrEmail.toLowerCase() || 
      u.email.toLowerCase() === usernameOrEmail.toLowerCase()
    );
    
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Generate token
    const token = `token_${user.id}_${Date.now()}`;
    
    console.log('Login successful for:', user.email);
    
    res.json({
      message: "Signin successful",
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      remember: remember
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user exists
    const existingUser = testUsers.find(u => 
      u.username.toLowerCase() === username.toLowerCase() || 
      u.email.toLowerCase() === email.toLowerCase()
    );
    
    if (existingUser) {
      return res.status(400).json({ message: "Username or Email already taken" });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create new user
    const newUser = {
      id: String(testUsers.length + 1),
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'user'
    };
    
    testUsers.push(newUser);
    
    const token = `token_${newUser.id}_${Date.now()}`;
    
    res.status(201).json({
      message: "Signup successful",
      token: token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    availableUsers: testUsers.map(u => ({
      username: u.username,
      email: u.email,
      role: u.role
    }))
  });
});

// Products endpoint (fallback)
app.get('/api/products', (req, res) => {
  const mockProducts = [
    {
      _id: "1",
      name: "Men's Classic White T-Shirt",
      price: 2499,
      image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
      category: "Men",
      is_featured: true
    },
    {
      _id: "2", 
      name: "Women's Fitted Cotton T-Shirt",
      price: 2299,
      sale_price: 1999,
      image_url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=800&fit=crop",
      category: "Women",
      is_featured: true
    },
    {
      _id: "3",
      name: "Kids' Fun Graphic T-Shirt", 
      price: 1599,
      sale_price: 1299,
      image_url: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800&fit=crop",
      category: "Kids",
      is_featured: true
    }
  ];
  
  res.json({ data: mockProducts });
});

const PORT = 4999;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('🔑 Test Login Credentials:');
  console.log('   Email: test@test.com | Password: test123');
  console.log('   Email: admin@test.com | Password: admin123'); 
  console.log('   Email: user1@test.com | Password: 123456');
  console.log('💡 You can also use usernames: testuser, admin, user1');
});
