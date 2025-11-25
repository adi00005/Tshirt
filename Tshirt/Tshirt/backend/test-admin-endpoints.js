// Test all admin endpoints
import http from 'http';

const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MTlhZTZlYWM4YzM2NmRhMmQyYTZlNiIsImlhdCI6MTc2MzI5MDczOSwiZXhwIjoxNzY1ODgyNzM5fQ.RaZo_9KVe6Gbud71vAy1zuZLAtwGiIfHtGmqaZAXwuE';

function testEndpoint(path, description) {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: `/api/admin${path}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`\n=== ${description} ===`);
    console.log(`Path: ${path}`);
    console.log(`Status Code: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        console.log('✅ Success:', parsed.success);
        if (parsed.success) {
          console.log('Data keys:', Object.keys(parsed.data || {}));
          if (parsed.data && Array.isArray(parsed.data)) {
            console.log('Array length:', parsed.data.length);
          }
        } else {
          console.log('Error:', parsed.message || parsed.error);
        }
      } catch (e) {
        console.log('Raw Response:', data.substring(0, 200));
      }
    });
  });

  req.on('error', (error) => {
    console.error(`${description} error:`, error.message);
  });

  req.end();
}

console.log('Testing Admin Endpoints...\n');

// Test various admin endpoints
testEndpoint('/dashboard', 'Admin Dashboard');
testEndpoint('/users', 'Get All Users');
testEndpoint('/orders', 'Get All Orders');
testEndpoint('/inventory', 'Get Inventory Stats');
testEndpoint('/products', 'Get All Products');
