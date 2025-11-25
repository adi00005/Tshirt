// Simple test server to verify API endpoints
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 4999;

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Mock featured products data - Expanded with more variety
const mockFeaturedProducts = [
  {
    _id: "mock1",
    name: "Athletic Performance Tee",
    price: 4149,
    sale_price: null,
    image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White", "Navy"],
    average_rating: 4.5,
    review_count: 128,
    stock_quantity: 15,
    is_featured: true,
    description: "Premium quality athletic T-shirt perfect for workouts and casual wear.",
    category: "Sports"
  },
  {
    _id: "mock2",
    name: "Classic White T-Shirt",
    price: 2074,
    sale_price: null,
    image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
    sizes: ["XS", "S", "M", "L"],
    colors: ["White", "Cream"],
    average_rating: 4.2,
    review_count: 89,
    stock_quantity: 8,
    is_featured: true,
    description: "Essential white T-shirt made from premium cotton.",
    category: "Basics"
  },
  {
    _id: "mock3",
    name: "Striped Long Sleeve Tee",
    price: 3320,
    sale_price: 2904,
    image_url: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500",
    sizes: ["M", "L", "XL"],
    colors: ["Navy/White", "Black/Gray"],
    average_rating: 4.7,
    review_count: 156,
    stock_quantity: 12,
    is_featured: true,
    description: "Stylish striped long sleeve T-shirt for a casual look.",
    category: "Casual"
  },
  {
    _id: "mock4",
    name: "Navy Blue Polo Shirt",
    price: 3319,
    sale_price: null,
    image_url: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Navy", "Black", "White"],
    average_rating: 4.3,
    review_count: 94,
    stock_quantity: 22,
    is_featured: true,
    description: "Classic navy polo shirt perfect for semi-formal occasions.",
    category: "Formal"
  },
  {
    _id: "mock5",
    name: "Vintage Graphic Tee",
    price: 2905,
    sale_price: 2490,
    image_url: "https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=500",
    sizes: ["S", "M", "L"],
    colors: ["Black", "Gray", "White"],
    average_rating: 4.6,
    review_count: 203,
    stock_quantity: 5,
    is_featured: true,
    description: "Trendy vintage graphic T-shirt with unique design.",
    category: "Vintage"
  },
  {
    _id: "mock6",
    name: "Premium Cotton Tee",
    price: 2490,
    sale_price: null,
    image_url: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Gray", "Black", "White", "Navy"],
    average_rating: 4.4,
    review_count: 167,
    stock_quantity: 18,
    is_featured: true,
    description: "Ultra-soft premium cotton T-shirt for everyday comfort.",
    category: "Premium"
  },
  {
    _id: "mock7",
    name: "Oversized Streetwear Tee",
    price: 3599,
    sale_price: 2879,
    image_url: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Black", "White", "Olive", "Burgundy"],
    average_rating: 4.8,
    review_count: 312,
    stock_quantity: 9,
    is_featured: true,
    description: "Trendy oversized streetwear T-shirt with modern fit.",
    category: "Streetwear"
  },
  {
    _id: "mock8",
    name: "Organic Hemp T-Shirt",
    price: 4999,
    sale_price: null,
    image_url: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500",
    sizes: ["S", "M", "L"],
    colors: ["Natural", "Forest Green", "Earth Brown"],
    average_rating: 4.9,
    review_count: 87,
    stock_quantity: 6,
    is_featured: true,
    description: "Eco-friendly organic hemp T-shirt for conscious consumers.",
    category: "Eco-Friendly"
  },
  {
    _id: "mock9",
    name: "Retro Band T-Shirt",
    price: 2799,
    sale_price: 2239,
    image_url: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=500",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Charcoal", "Vintage White"],
    average_rating: 4.6,
    review_count: 445,
    stock_quantity: 14,
    is_featured: true,
    description: "Classic retro band T-shirt with authentic vintage feel.",
    category: "Music"
  },
  {
    _id: "mock10",
    name: "Minimalist Pocket Tee",
    price: 1899,
    sale_price: null,
    image_url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["White", "Black", "Gray", "Navy", "Sage"],
    average_rating: 4.3,
    review_count: 198,
    stock_quantity: 28,
    is_featured: true,
    description: "Clean minimalist design with subtle chest pocket detail.",
    category: "Minimalist"
  },
  {
    _id: "mock11",
    name: "Tie-Dye Festival Tee",
    price: 3199,
    sale_price: 2559,
    image_url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500",
    sizes: ["S", "M", "L"],
    colors: ["Rainbow", "Sunset", "Ocean Blue"],
    average_rating: 4.4,
    review_count: 156,
    stock_quantity: 11,
    is_featured: true,
    description: "Vibrant tie-dye T-shirt perfect for festivals and summer vibes.",
    category: "Festival"
  },
  {
    _id: "mock12",
    name: "Tech Fabric Performance Tee",
    price: 5499,
    sale_price: null,
    image_url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Charcoal", "Electric Blue"],
    average_rating: 4.7,
    review_count: 234,
    stock_quantity: 7,
    is_featured: true,
    description: "Advanced tech fabric with moisture-wicking and anti-odor properties.",
    category: "Tech"
  }
];

// API Routes
app.get('/api/products/featured', (req, res) => {
  console.log('Featured products requested');
  res.json({
    success: true,
    count: mockFeaturedProducts.length,
    data: mockFeaturedProducts
  });
});

app.get('/api/products/:id', (req, res) => {
  console.log(`Product ${req.params.id} requested`);
  const product = mockFeaturedProducts.find(p => p._id === req.params.id);
  
  if (product) {
    res.json({
      success: true,
      data: product
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log(`📡 Featured products API: http://localhost:${PORT}/api/products/featured`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});
