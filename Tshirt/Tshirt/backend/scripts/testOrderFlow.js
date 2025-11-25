import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure axios to not throw on non-2xx status codes
axios.defaults.validateStatus = () => true;

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
let authToken = '';

const testOrderFlow = async () => {
  try {
    console.log('🚀 Starting order flow test...');

    // 1. Login first to get auth token
    console.log('\n🔐 Logging in...');
    const loginResponse = await axios.post(
      `${API_URL}/auth/login`,
      {
        email: 'test@example.com',
        password: 'Test@1234'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 5000
      }
    );

    if (!loginResponse.data.success) {
      throw new Error(`Login failed: ${loginResponse.data.message || 'Unknown error'}`);
    }

    authToken = loginResponse.data.token;
    const userId = loginResponse.data.user?._id;
    
    if (!authToken) {
      throw new Error('No authentication token received');
    }

    console.log('✅ Login successful');
    console.log('👤 User ID:', userId);
    console.log('🔑 Token:', authToken.substring(0, 20) + '...');

    // 2. Create a new order
    console.log('\n🛒 Creating new order...');
    const orderData = {
      items: [
        {
          productId: '60d21b4667d0d8992e610c85', // Replace with actual product ID
          name: 'Test Product',
          quantity: 2,
          price: 29.99,
          image: '/images/test-product.jpg'
        }
      ],
      shippingInfo: {
        address: '123 Test St',
        city: 'Test City',
        postalCode: '12345',
        country: 'Test Country',
        phone: '1234567890'
      },
      paymentInfo: {
        method: 'card',
        status: 'pending'
      },
      subtotal: 59.98,
      total: 64.98,
      shippingPrice: 5.00
    };

    const createOrderResponse = await axios.post(
      `${API_URL}/orders`,
      orderData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        },
        timeout: 10000
      }
    );

    if (!createOrderResponse.data._id) {
      console.error('❌ Failed to create order:', createOrderResponse.data);
      throw new Error('Order creation failed');
    }

    const orderId = createOrderResponse.data._id;
    console.log(`✅ Order created with ID: ${orderId}`);

    // 3. Get the created order
    console.log('\n📦 Retrieving order details...');
    const getOrderResponse = await axios.get(
      `${API_URL}/orders/${orderId}`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        },
        timeout: 5000
      }
    );

    if (!getOrderResponse.data._id) {
      console.error('❌ Failed to retrieve order:', getOrderResponse.data);
      throw new Error('Order retrieval failed');
    }

    console.log('✅ Order retrieved successfully');
    console.log('📄 Order status:', getOrderResponse.data.status);
    console.log('💰 Total amount:', getOrderResponse.data.total);

    // 4. Update order status (simulate payment)
    console.log('\n💳 Updating order status to paid...');
    const updateResponse = await axios.put(
      `${API_URL}/orders/${orderId}/pay`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        },
        timeout: 5000
      }
    );

    if (!updateResponse.data.success) {
      console.error('❌ Failed to update order status:', updateResponse.data);
      throw new Error('Order status update failed');
    }

    console.log('✅ Order status updated to paid');

    // 5. Get order history
    console.log('\n📋 Getting order history...');
    const ordersResponse = await axios.get(
      `${API_URL}/orders/myorders`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        },
        timeout: 5000
      }
    );

    if (!Array.isArray(ordersResponse.data)) {
      console.error('❌ Failed to get order history:', ordersResponse.data);
      throw new Error('Order history retrieval failed');
    }

    console.log('\n📊 Order History:');
    console.log(ordersResponse.data.map(order => ({
      _id: order._id,
      status: order.status,
      total: order.total,
      isPaid: order.isPaid,
      isDelivered: order.isDelivered,
      createdAt: order.createdAt
    })));

    console.log('\n🎉 Order flow test completed successfully!');

  } catch (error) {
    console.error('\n🔥 Test failed with error:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Is the server running?');
      console.error('Request:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    
    process.exit(1);
  }
};

// Run the test
testOrderFlow();
