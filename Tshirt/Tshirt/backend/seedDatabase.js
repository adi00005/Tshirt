// Database seeding script to populate MongoDB with sample data
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

// Import models
import User from './src/models/User.js';
import Product from './src/models/Product.js';
import Category from './src/models/Category.js';
import Order from './src/models/Order.js';
import Design from './src/models/Design.js';

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      Order.deleteMany({}),
      Design.deleteMany({})
    ]);
    console.log('🗑️  Cleared all existing data');

    // 1. Create Categories
    console.log('🌱 Seeding categories...');
    const categories = [
      { name: 'Men', slug: 'men', description: 'Mens T-Shirts' },
      { name: 'Women', slug: 'women', description: 'Womens T-Shirts' },
      { name: 'Kids', slug: 'kids', description: 'Kids T-Shirts' },
      { name: 'Custom', slug: 'custom', description: 'Custom Designs' },
    ];
    
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // 2. Create Admin User
    console.log('👤 Creating admin user...');
    
    // Delete existing admin user if exists
    await User.deleteMany({ email: 'admin@example.com' });
    
    // Create new admin user with pre-hashed password
    const adminUser = new User({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin123', // Will be hashed by the pre-save hook
      isAdmin: true,
      isActive: true,
      emailVerified: true,
      lastLogin: new Date()
    });
    
    // Save the user to trigger the pre-save hook for password hashing
    await adminUser.save();
    
    console.log(`✅ Created admin user: ${adminUser.email}`);
    console.log('Admin password: admin123'); // For testing purposes

    // 3. Create Sample Products
    console.log('👕 Seeding products...');
    const products = [
      {
        name: 'Classic White T-Shirt',
        slug: 'classic-white-tshirt',
        description: 'Essential white T-shirt made from premium cotton.',
        short_description: 'Essential white cotton T-shirt',
        price: 2499,
        sale_price: 1999,
        stock_quantity: 50,
        stock_status: 'in_stock',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: ['White', 'Black', 'Navy'],
        material: '100% Cotton',
        fit: 'Regular',
        category_id: createdCategories[0]._id, // Men's category
        brand: 'TShirt Store',
        image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
        is_featured: true,
        status: 'active',
        currency: 'INR'
      },
      {
        name: 'Slim Fit V-Neck',
        slug: 'slim-fit-vneck',
        description: 'Comfortable slim fit v-neck t-shirt.',
        short_description: 'Slim fit v-neck t-shirt',
        price: 2799,
        stock_quantity: 35,
        stock_status: 'in_stock',
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['Black', 'Gray', 'Burgundy'],
        material: '95% Cotton, 5% Elastane',
        fit: 'Slim',
        category_id: createdCategories[1]._id, // Women's category
        brand: 'Fashion Plus',
        image_url: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9',
        is_featured: true,
        status: 'active',
        currency: 'INR'
      },
      {
        name: 'Athletic Performance Tee',
        slug: 'athletic-performance-tee',
        description: 'Premium quality athletic T-shirt perfect for workouts and casual wear.',
        short_description: 'Athletic performance t-shirt',
        price: 3499,
        stock_quantity: 25,
        stock_status: 'in_stock',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['Black', 'Navy', 'Gray', 'Red'],
        material: '100% Polyester',
        fit: 'Slim',
        category_id: createdCategories[0]._id, // Men's category
        brand: 'TShirt Store',
        image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        is_featured: true,
        status: 'active',
        currency: 'INR'
      },
      {
        name: 'Men\'s Classic White T-Shirt',
        slug: 'mens-classic-white-tshirt',
        description: 'Essential white T-shirt made from premium cotton. A wardrobe staple that goes with everything.',
        short_description: 'Essential white cotton T-shirt',
        price: 2499,
        sale_price: null,
        stock_quantity: 50,
        stock_status: 'in_stock',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: ['White', 'Black', 'Navy'],
        material: '100% Cotton',
        fit: 'Regular',
        category_id: createdCategories[0]._id, // Men's category
        brand: 'TShirt Store',
        image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop',
        is_featured: true,
        status: 'active',
        currency: 'INR'
      },
      {
        name: 'Men\'s Vintage Graphic Tee',
        slug: 'mens-vintage-graphic-tee',
        description: 'Trendy vintage graphic T-shirt with unique design. Perfect for casual outings and expressing your style.',
        short_description: 'Trendy vintage graphic T-shirt',
        price: 2999,
        sale_price: 2499,
        stock_quantity: 25,
        stock_status: 'in_stock',
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['Black', 'Gray', 'White'],
        material: '100% Cotton',
        fit: 'Regular',
        category_id: createdCategories[0]._id, // Men's category
        brand: 'TShirt Store',
        image_url: 'https://images.unsplash.com/photo-1503341504253-d851c5c3a990?w=800&h=800&fit=crop',
        is_featured: true,
        status: 'active',
        currency: 'INR'
      },
      {
        name: 'Women\'s Fitted Cotton T-Shirt',
        slug: 'womens-fitted-cotton-tshirt',
        description: 'Tailored specifically for women with a flattering fit. Made from soft, breathable cotton for all-day comfort.',
        short_description: 'Women\'s fitted cotton T-shirt',
        price: 2299,
        sale_price: 1999,
        stock_quantity: 30,
        stock_status: 'in_stock',
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['Pink', 'White', 'Black', 'Purple'],
        material: '100% Cotton',
        fit: 'Slim',
        category_id: createdCategories[1]._id, // Women's category
        brand: 'TShirt Store',
        image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=800&fit=crop',
        is_featured: true,
        status: 'active',
        currency: 'INR'
      },
      {
        name: 'Women\'s V-Neck Basic Tee',
        slug: 'womens-vneck-basic-tee',
        description: 'Classic V-neck T-shirt designed for women. Soft cotton blend with a flattering fit for all body types.',
        short_description: 'Women\'s classic V-neck T-shirt',
        price: 2199,
        sale_price: 1899,
        stock_quantity: 35,
        stock_status: 'in_stock',
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['White', 'Black', 'Red', 'Blue'],
        material: '95% Cotton, 5% Elastane',
        fit: 'Regular',
        category_id: createdCategories[1]._id, // Women's category
        brand: 'TShirt Store',
        image_url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&h=800&fit=crop',
        is_featured: true,
        status: 'active',
        currency: 'INR'
      },
      {
        name: 'Women\'s Organic Cotton Tee',
        slug: 'womens-organic-cotton-tee',
        description: 'Made from 100% organic cotton. Environmentally conscious choice without compromising on comfort and style.',
        short_description: 'Women\'s organic cotton T-shirt',
        price: 2799,
        sale_price: 2399,
        stock_quantity: 15,
        stock_status: 'in_stock',
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['Natural', 'Earth Brown', 'Forest Green'],
        material: '100% Organic Cotton',
        fit: 'Regular',
        category_id: createdCategories[1]._id, // Women's category
        brand: 'TShirt Store',
        image_url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=800&fit=crop',
        is_featured: true,
        status: 'active',
        currency: 'INR'
      },
      {
        name: 'Kids\' Fun Graphic T-Shirt',
        slug: 'kids-fun-graphic-tshirt',
        description: 'Colorful and fun graphic T-shirt designed for kids. Soft, comfortable fabric that\'s perfect for play and everyday wear.',
        short_description: 'Kids\' fun graphic T-shirt',
        price: 1599,
        sale_price: 1299,
        stock_quantity: 25,
        stock_status: 'in_stock',
        sizes: ['XS', 'S', 'M'],
        colors: ['Blue', 'Red', 'Green', 'Yellow'],
        material: '100% Cotton',
        fit: 'Regular',
        category_id: createdCategories[2]._id, // Kids' category
        brand: 'TShirt Store',
        image_url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800&fit=crop',
        is_featured: true,
        status: 'active',
        currency: 'INR'
      },
      {
        name: 'Kids\' Basic Cotton T-Shirt',
        slug: 'kids-basic-cotton-tshirt',
        description: 'Essential cotton T-shirt for kids. Durable, comfortable, and perfect for everyday adventures.',
        short_description: 'Kids\' basic cotton T-shirt',
        price: 1299,
        sale_price: null,
        stock_quantity: 40,
        stock_status: 'in_stock',
        sizes: ['XS', 'S', 'M', 'L'],
        colors: ['White', 'Blue', 'Pink', 'Gray'],
        material: '100% Cotton',
        fit: 'Regular',
        category_id: createdCategories[2]._id, // Kids' category
        brand: 'TShirt Store',
        image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop',
        is_featured: true,
        status: 'active',
        currency: 'INR'
      },
      {
        name: 'Kids\' Long Sleeve T-Shirt',
        slug: 'kids-long-sleeve-tshirt',
        description: 'Cozy long sleeve T-shirt for kids. Perfect for cooler weather and layering.',
        short_description: 'Kids\' long sleeve T-shirt',
        price: 1799,
        sale_price: null,
        stock_quantity: 20,
        stock_status: 'in_stock',
        sizes: ['S', 'M', 'L'],
        colors: ['Navy', 'Red', 'Purple', 'Orange'],
        material: '100% Cotton',
        fit: 'Regular',
        category_id: createdCategories[2]._id, // Kids' category
        brand: 'TShirt Store',
        image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop',
        is_featured: false,
        status: 'active',
        currency: 'INR'
      }
    ];
    
    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products`);

    // 4. Create Sample Design
    console.log('🎨 Creating sample design...');
    const design = await Design.create({
      name: 'Summer Vibes',
      description: 'Colorful summer design',
      createdBy: adminUser._id,
      designData: { 
        // Sample design data structure
        elements: [
          {
            type: 'text',
            content: 'Summer 2024',
            position: { x: 100, y: 100 },
            style: {
              fontFamily: 'Arial',
              fontSize: 24,
              color: '#FF5733',
              textAlign: 'center'
            }
          },
          {
            type: 'image',
            url: 'https://example.com/summer-graphic.png',
            position: { x: 150, y: 150 },
            size: { width: 200, height: 200 }
          }
        ],
        canvas: {
          width: 800,
          height: 1000,
          backgroundColor: '#FFFFFF'
        }
      },
      thumbnail: 'https://via.placeholder.com/300x400?text=Summer+Vibes',
      previewImage: 'https://via.placeholder.com/800x1000?text=Summer+Vibes+Preview',
      isPublic: true,
      category: 'tshirt',
      category_id: createdCategories[3]._id, // Custom category
      status: 'active',
      tags: ['summer', 'vibes', '2024']
    });
    console.log('✅ Created sample design');

    // 5. Create Sample Order
    console.log('🛒 Creating sample order...');
    
    // Generate a unique order ID (format: ORD-YYYYMMDD-XXXXX)
    const orderId = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10000 + Math.random() * 90000)}`;
    
    // Calculate prices
    const product1Price = createdProducts[0].sale_price || createdProducts[0].price;
    const product2Price = createdProducts[1].sale_price || createdProducts[1].price;
    const subtotal = (product1Price * 2) + product2Price; // 2 of first product, 1 of second
    
    const order = await Order.create({
      orderId,
      userId: adminUser._id,
      items: [
        {
          productId: createdProducts[0]._id.toString(),
          name: createdProducts[0].name,
          quantity: 2,
          price: product1Price,
          size: 'M',
          color: 'Black',
          image: createdProducts[0].image_url,
          customization: {
            text: 'Custom Text',
            design: design._id,
            placement: 'front',
            color: '#FF0000',
            font: 'Arial'
          }
        },
        {
          productId: createdProducts[1]._id.toString(),
          name: createdProducts[1].name,
          quantity: 1,
          price: product2Price,
          size: 'S',
          color: createdProducts[1].colors[0],
          image: createdProducts[1].image_url
        }
      ],
      shippingInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+911234567890',
        address: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        pincode: '400001',
        country: 'India'
      },
      paymentInfo: {
        method: 'card',
        status: 'completed',
        transactionId: `txn_${Math.random().toString(36).substr(2, 9)}`,
        amount: subtotal,
        cardLast4: '4242',
        paymentStatus: 'completed',
        paidAt: new Date()
      },
      subtotal: subtotal,
      taxPrice: Math.round(subtotal * 0.18), // 18% tax
      shippingCost: 0,
      total: subtotal + Math.round(subtotal * 0.18),
      status: 'processing',
      isPaid: true,
      paidAt: new Date(),
      isDelivered: false,
      statusHistory: [{
        status: 'processing',
        changedAt: new Date(),
        changedBy: adminUser._id,
        notes: 'Order created'
      }],
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });
    console.log('✅ Created sample order');

    console.log('\n🌱 Database seeding completed successfully!');
    console.log('------------------------------------------');
    console.log('🌐 Access your admin panel at: http://localhost:3000/admin');
    console.log('👤 Admin email: admin@example.com');
    console.log('🔑 Password: admin123');
    console.log('------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
