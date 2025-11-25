// Test frontend authentication flow
import http from 'http';

// Test admin login exactly as frontend would do
const postData = JSON.stringify({
  email: 'admin@test.com',
  password: 'admin123'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/signin',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Origin': 'http://localhost:3000',  // Simulate frontend origin
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response Body:', data);
    try {
      const parsed = JSON.parse(data);
      console.log('Success:', parsed.success);
      console.log('User Data:', parsed.user);
      console.log('Is Admin:', parsed.user?.isAdmin);
      
      if (parsed.success && parsed.user?.isAdmin) {
        console.log('✅ Admin login successful - should redirect to /admin');
      } else {
        console.log('❌ Admin login failed or user is not admin');
      }
    } catch (e) {
      console.error('Failed to parse JSON:', e.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request Error:', error.message);
});

req.write(postData);
req.end();

console.log('Testing admin login with frontend simulation...');
