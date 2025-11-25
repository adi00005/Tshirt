import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

dotenv.config();

const USERS = [
  {
    name: 'Admin User',
    email: 'admin@tshirtstore.com',
    password: 'admin123',
    isAdmin: true,
    isActive: true,
    emailVerified: true
  },
  {
    name: 'Manoj Kendri',
    email: 'manukendri7@gmail.com',
    password: 'password123',
    isAdmin: true,
    isActive: true,
    emailVerified: true
  },
  {
    name: 'Test Customer',
    email: 'customer@example.com',
    password: 'customer123',
    isAdmin: false,
    isActive: true,
    emailVerified: true
  }
];

const CATEGORIES = [
  {
    name: "Men's T-Shirts",
    slug: 'mens-tshirts',
    description: 'Comfortable and stylish tees tailored for men',
    image: 'https://res.cloudinary.com/demo/image/upload/v1699999999/categories/mens.jpg'
  },
  {
    name: "Women's T-Shirts",
    slug: 'womens-tshirts',
    description: 'Trendy fits redesigned for women',
    image: 'https://res.cloudinary.com/demo/image/upload/v1699999999/categories/womens.jpg'
  },
  {
    name: 'Unisex Essentials',
    slug: 'unisex-essentials',
    description: 'Daily comfort for everyone',
    image: 'https://res.cloudinary.com/demo/image/upload/v1699999999/categories/unisex.jpg'
  },
  {
    name: 'Graphic Tees',
    slug: 'graphic-tees',
    description: 'Statement graphics by independent artists',
    image: 'https://res.cloudinary.com/demo/image/upload/v1699999999/categories/graphic.jpg'
  }
];

const PRODUCTS = [
  {
    name: 'Classic White Crew',
    slug: 'classic-white-crew',
    short_description: '280 GSM premium cotton crew neck in optic white',
    description: 'Cut from long-staple cotton with reinforced seams. Breathable, durable and perfect for layering.',
    price: 24.99,
    sale_price: 19.99,
    stock_quantity: 120,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White'],
    material: '100% Organic Cotton',
    fit: 'Regular',
    image_url: 'https://res.cloudinary.com/demo/image/upload/v1699999999/products/white-crew.jpg',
    gallery_images: [
      'https://res.cloudinary.com/demo/image/upload/v1699999999/products/white-crew-1.jpg',
      'https://res.cloudinary.com/demo/image/upload/v1699999999/products/white-crew-2.jpg'
    ],
    brand: 'Everyday Co',
    tags: ['classic', 'cotton', 'minimal'],
    is_featured: true,
    specifications: {
      Fabric: '100% Organic Cotton',
      GSM: '280',
      Care: 'Machine wash cold'
    }
  },
  {
    name: 'Midnight Graphic Tee',
    slug: 'midnight-graphic-tee',
    short_description: 'Black tee with reflective skyline print',
    description: 'Soft-hand water based inks paired with a relaxed silhouette. Designed for night city strolls.',
    price: 34.99,
    sale_price: 28.99,
    stock_quantity: 80,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black'],
    material: 'Polyester Blend',
    fit: 'Relaxed',
    image_url: 'https://res.cloudinary.com/demo/image/upload/v1699999999/products/midnight-graphic.jpg',
    brand: 'UrbanPulse',
    tags: ['graphic', 'nightlife'],
    is_featured: true
  },
  {
    name: 'Coastal Dye Tee',
    slug: 'coastal-dye-tee',
    short_description: 'Hand-dyed gradient inspired by shoreline mornings',
    description: 'Each tee is uniquely dyed giving a one-of-a-kind finish. Lightweight and soft-touch.',
    price: 39.5,
    stock_quantity: 60,
    sizes: ['S', 'M', 'L'],
    colors: ['Blue', 'Teal'],
    material: 'Bamboo',
    fit: 'Slim',
    image_url: 'https://res.cloudinary.com/demo/image/upload/v1699999999/products/coastal-dye.jpg',
    brand: 'Shoreline Studio',
    tags: ['handmade', 'summer']
  },
  {
    name: 'Performance Tech Tee',
    slug: 'performance-tech-tee',
    short_description: 'Moisture-wicking fabric with mesh ventilation panels',
    description: 'Designed for high-intensity workouts with 4-way stretch and odor control finish.',
    price: 44.99,
    stock_quantity: 90,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Charcoal', 'Neon Green'],
    material: 'Polyester Blend',
    fit: 'Slim Fit',
    image_url: 'https://res.cloudinary.com/demo/image/upload/v1699999999/products/performance-tech.jpg',
    brand: 'PulseWear',
    tags: ['active', 'performance'],
    is_featured: true
  }
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const hashPasswords = async () => {
  const hashedUsers = [];
  for (const user of USERS) {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(user.password, salt);
    hashedUsers.push({ ...user, password });
  }
  return hashedUsers;
};

const seedDatabase = async () => {
  try {
    await connectDB();

    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({})
    ]);
    console.log('🧹 Cleared existing collections');

    const users = await User.insertMany(await hashPasswords());
    console.log(`👥 Inserted ${users.length} users`);

    const categories = await Category.insertMany(CATEGORIES);
    console.log(`🏷️ Inserted ${categories.length} categories`);

    const categoryMap = categories.reduce((acc, category) => {
      acc[category.slug] = category._id;
      return acc;
    }, {});

    const productsWithCategories = PRODUCTS.map((product, index) => ({
      ...product,
      category_id:
        index % 2 === 0
          ? categoryMap['mens-tshirts']
          : categoryMap['graphic-tees'],
      status: 'active',
      stock_status: product.stock_quantity > 0 ? 'in_stock' : 'out_of_stock'
    }));

    const products = await Product.insertMany(productsWithCategories);
    console.log(`👕 Inserted ${products.length} products`);

    console.log('\n✅ Database initialization complete!');
    console.log('Admin login: admin@tshirtstore.com / admin123');
    console.log('Customer login: customer@example.com / customer123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
