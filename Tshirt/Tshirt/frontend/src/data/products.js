const products = [
  // Men's T-Shirts
  {
    _id: 'm1',
    name: 'Classic Cotton T-Shirt',
    brand: 'ComfortWear',
    price: 1999,
    sale_price: 1499,
    image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Black', 'Gray', 'Navy'],
    average_rating: 4.5,
    review_count: 128,
    category: 'men',
    in_stock: true,
    featured: true
  },
  {
    _id: 'm2',
    name: 'Slim Fit V-Neck Tee',
    brand: 'UrbanStyle',
    price: 1799,
    image_url: 'https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=800',
    sizes: ['S', 'M', 'L'],
    colors: ['Black', 'Charcoal', 'Burgundy'],
    average_rating: 4.2,
    review_count: 87,
    category: 'men',
    in_stock: true
  },
  {
    _id: 'm3',
    name: 'Essential Heavyweight Crew',
    brand: 'District Co.',
    price: 2299,
    sale_price: 1899,
    image_url: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=800',
    sizes: ['M', 'L', 'XL'],
    colors: ['Olive', 'Sand', 'Black'],
    average_rating: 4.7,
    review_count: 203,
    category: 'men',
    in_stock: true,
    featured: true
  },
  {
    _id: 'm4',
    name: 'AirFlex Performance Tee',
    brand: 'PulseGear',
    price: 2499,
    image_url: 'https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?w=800',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Cobalt', 'Graphite'],
    average_rating: 4.4,
    review_count: 96,
    category: 'men',
    in_stock: true
  },

  // Women's T-Shirts
  {
    _id: 'w1',
    name: 'Draped Modal Tee',
    brand: 'Luna Studio',
    price: 1899,
    sale_price: 1599,
    image_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Blush', 'Ivory', 'Mocha'],
    average_rating: 4.8,
    review_count: 174,
    category: 'women',
    in_stock: true,
    featured: true
  },
  {
    _id: 'w2',
    name: 'Wrap Front Crop Tee',
    brand: 'NovaWear',
    price: 1599,
    image_url: 'https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=800',
    sizes: ['XS', 'S', 'M'],
    colors: ['Terracotta', 'Sage', 'White'],
    average_rating: 4.3,
    review_count: 65,
    category: 'women',
    in_stock: true
  },
  {
    _id: 'w3',
    name: 'Everyday Oversized Tee',
    brand: 'Muse Label',
    price: 2099,
    image_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&fit=crop&crop=faces',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Dusty Blue', 'Charcoal', 'Soft Pink'],
    average_rating: 4.6,
    review_count: 142,
    category: 'women',
    in_stock: true
  },

  // Gender Neutral / Lifestyle
  {
    _id: 'u1',
    name: 'Studio Artist Tee',
    brand: 'Canvas Society',
    price: 1699,
    sale_price: 1399,
    image_url: 'https://images.unsplash.com/photo-1502323774997-7b9dd3ebc8e6?w=800',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Bone', 'Ink', 'Rust'],
    average_rating: 4.9,
    review_count: 321,
    category: 'unisex',
    in_stock: true,
    featured: true
  },
  {
    _id: 'u2',
    name: 'Minimal Serif Graphic Tee',
    brand: 'Typeface',
    price: 1499,
    image_url: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=820',
    sizes: ['S', 'M', 'L'],
    colors: ['White', 'Black'],
    average_rating: 4.1,
    review_count: 54,
    category: 'unisex',
    in_stock: true
  },
  {
    _id: 'u3',
    name: 'City Explorer Pocket Tee',
    brand: 'Nomad Supply',
    price: 2199,
    sale_price: 1899,
    image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=820',
    sizes: ['M', 'L', 'XL'],
    colors: ['Khaki', 'Slate', 'Ecru'],
    average_rating: 4.5,
    review_count: 112,
    category: 'unisex',
    in_stock: true
  },

  // Kids
  {
    _id: 'k1',
    name: 'Cosmic Explorer Tee',
    brand: 'Mini Futures',
    price: 999,
    image_url: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=800',
    sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'],
    colors: ['Navy', 'Sky', 'Lilac'],
    average_rating: 4.7,
    review_count: 88,
    category: 'kids',
    in_stock: true
  },
  {
    _id: 'k2',
    name: 'Pastel Dream Ruffle Tee',
    brand: 'Sprout & Co.',
    price: 1199,
    sale_price: 999,
    image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=820',
    sizes: ['2-3Y', '4-5Y', '6-7Y'],
    colors: ['Lavender', 'Mint', 'Cream'],
    average_rating: 4.4,
    review_count: 52,
    category: 'kids',
    in_stock: true
  }
];

export default products;
