import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product.js';
import Category from '../src/models/Category.js';

dotenv.config();

const sampleCategories = [
  { name: 'Men\'s T-Shirts', slug: 'mens-tshirts', description: 'Comfortable and stylish t-shirts for men' },
  { name: 'Women\'s T-Shirts', slug: 'womens-tshirts', description: 'Trendy and comfortable t-shirts for women' },
  { name: 'Unisex T-Shirts', slug: 'unisex-tshirts', description: 'Versatile t-shirts for everyone' },
  { name: 'Designer T-Shirts', slug: 'designer-tshirts', description: 'Premium designer t-shirts' },
  { name: 'Graphic Tees', slug: 'graphic-tees', description: 'T-shirts with unique graphic designs' }
];

const sampleProducts = [
  {
    name: 'Classic White T-Shirt',
    slug: 'classic-white-tshirt',
    sku: 'TS-WHITE-001',
    short_description: '100% cotton classic fit white t-shirt',
    description: 'Premium quality white t-shirt made from 100% organic cotton. Perfect for any casual occasion.',
    price: 24.99,
    sale_price: 19.99,
    stock_quantity: 100,
    stock_status: 'in_stock',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White'],
    material: '100% Organic Cotton',
    fit: 'Regular',
    weight: 0.2,
    image_url: 'https://res.cloudinary.com/demo/image/upload/v1631234567/tshirts/white-tshirt.jpg',
    gallery_images: [
      'https://res.cloudinary.com/demo/image/upload/v1631234567/tshirts/white-tshirt-1.jpg',
      'https://res.cloudinary.com/demo/image/upload/v1631234567/tshirts/white-tshirt-2.jpg'
    ],
    brand: 'PremiumWear',
    is_featured: true,
    average_rating: 4.5,
    review_count: 128,
    tags: ['basic', 'casual', 'cotton', 'white'],
    specifications: {
      'Fabric': '100% Organic Cotton',
      'Care Instructions': 'Machine wash cold, tumble dry low',
      'Origin': 'Made in USA'
    },
    status: 'active'
  },
  // Add more sample products...
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Add categories
    const createdCategories = await Category.insertMany(sampleCategories);
    console.log('Added categories');

    // Map category names to their IDs
    const categoryMap = {};
    createdCategories.forEach(category => {
      categoryMap[category.name] = category._id;
    });

    // Update products with category IDs
    const productsWithCategories = sampleProducts.map(product => ({
      ...product,
      category_id: categoryMap["Men's T-Shirts"] // Default to Men's T-Shirts
    }));

    // Add products
    await Product.insertMany(productsWithCategories);
    console.log('Added products');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
