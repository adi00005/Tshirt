import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure axios to not throw on non-2xx status codes
axios.defaults.validateStatus = () => true;

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

const testLogin = async () => {
  try {
    console.log('🚀 Testing login functionality...');
    
    // Test with email login
    console.log('\n🔑 Testing login with email...');
    await testLoginWithCredentials({
      email: 'test@example.com',
      password: 'Test@1234'
    }, true);

    // Test with username login
    console.log('\n👤 Testing login with username...');
    await testLoginWithCredentials({
      username: 'Test User',
      password: 'Test@1234'
    }, true);

    // Test with invalid credentials
    console.log('\n❌ Testing with invalid credentials...');
    await testLoginWithCredentials({
      email: 'wrong@example.com',
      password: 'wrongpassword'
    }, false);

  } catch (error) {
    console.error('\n🔥 Test failed with error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received. Is the server running?');
      console.error('Request:', error.request);
    } else {
      console.error('Error:', error.message);
    }
  }
};

const testLoginWithCredentials = async (credentials, expectSuccess = true) => {
  try {
    const { email, username } = credentials;
    const loginType = email ? 'email' : 'username';
    
    console.log(`\n🔍 Attempting login with ${loginType}: ${email || username}`);
    
    const response = await axios.post(
      `${API_URL}/auth/login`,
      credentials,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 5000 // 5 second timeout
      }
    );

    console.log('📡 Response status:', response.status);
    
    if (response.data.success) {
      console.log('✅ Login successful!');
      console.log('👤 User:', response.data.user);
      console.log('🔑 Token:', response.data.token ? 'Received' : 'Missing');
      
      if (!expectSuccess) {
        console.error('❌ Expected login to fail but it succeeded!');
      }
    } else {
      console.log('❌ Login failed:', response.data.message || 'No error message');
      if (expectSuccess) {
        console.error('❌ Expected login to succeed but it failed');
      } else {
        console.log('✅ Expected failure - test passed');
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('\n⚠️ Error during login test:');
    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out. Is the server running?');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused. Is the server running at', API_URL, '?');
    } else if (error.response) {
      console.error('Server responded with status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    
    if (expectSuccess) {
      console.error('❌ Expected login to succeed but it failed with error');
    }
    
    throw error;
  }
};

// Run the test
testLogin();
