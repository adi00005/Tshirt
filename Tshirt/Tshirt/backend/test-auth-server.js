// Simple test server for authentication without MongoDB
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 4999;
const JWT_SECRET = 'test-secret-key';

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Mock user data
const mockUsers = [
  {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123' // In real app, this would be hashed
  },
  {
    id: 2,
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123'
  }
];

// Mock products data
const mockProducts = [
  {
    _id: '1',
    name: 'Classic White T-Shirt',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    category: 'Men',
    isFeatured: true,
    description: 'Premium cotton white t-shirt'
  },
  {
    _id: '2',
    name: 'Vintage Black Tee',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1583743814966-8936f37f82b6?w=400',
    category: 'Men',
    isFeatured: true,
    description: 'Comfortable black vintage style t-shirt'
  },
  {
    _id: '3',
    name: 'Graphic Design Shirt',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400',
    category: 'Women',
    isFeatured: true,
    description: 'Trendy graphic design t-shirt'
  }
];

// Auth Routes
app.post('/api/auth/signin', (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    // Find user
    const user = mockUsers.find(u => 
      u.username === usernameOrEmail || 
      u.email === usernameOrEmail
    );

    if (!user || user.password !== password) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Signin successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error during signin' 
    });
  }
});

app.post('/api/auth/signup', (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = mockUsers.find(u => 
      u.username === username || u.email === email
    );

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists' 
      });
    }

    // Create new user
    const newUser = {
      id: mockUsers.length + 1,
      username,
      email,
      password // In real app, hash this
    };

    mockUsers.push(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        username: newUser.username,
        email: newUser.email 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Signup successful',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error during signup' 
    });
  }
});

// Product Routes
app.get('/api/products', (req, res) => {
  res.json(mockProducts);
});

app.get('/api/products/featured', (req, res) => {
  const featuredProducts = mockProducts.filter(p => p.isFeatured);
  res.json(featuredProducts);
});

app.get('/api/products/:id', (req, res) => {
  const product = mockProducts.find(p => p._id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Test server running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`🌐 Environment: test`);
  console.log(`✅ Mock authentication enabled`);
  console.log(`📦 Mock products loaded: ${mockProducts.length}`);
  console.log(`👥 Mock users available: ${mockUsers.length}`);
  console.log('\n📝 Test Credentials:');
  console.log('   Username: testuser | Password: password123');
  console.log('   Username: admin    | Password: admin123');
});
