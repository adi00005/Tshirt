// Test admin authentication
import http from 'http';

const adminData = {
  email: 'admin@test.com',
  password: 'admin123'
};

const postData = JSON.stringify(adminData);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/signin',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response Body:', data);
    try {
      const parsed = JSON.parse(data);
      console.log('Parsed Response:', parsed);
      
      if (parsed.success && parsed.token) {
        console.log('✅ Admin login successful!');
        console.log('Token:', parsed.token);
        console.log('User is admin:', parsed.user.isAdmin);
        
        // Now test admin dashboard with token
        testAdminDashboard(parsed.token);
      } else {
        console.log('❌ Admin login failed');
      }
    } catch (e) {
      console.log('Non-JSON Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.write(postData);
req.end();

console.log('Testing admin login...');
console.log('Request data:', adminData);

// Test admin dashboard endpoint
function testAdminDashboard(token) {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/dashboard',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`\n=== Admin Dashboard Test ===`);
    console.log(`Status Code: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response Body:', data);
      try {
        const parsed = JSON.parse(data);
        console.log('✅ Admin dashboard access:', parsed.success ? 'SUCCESS' : 'FAILED');
        if (parsed.success) {
          console.log('Dashboard stats keys:', Object.keys(parsed.data || {}));
        }
      } catch (e) {
        console.log('Non-JSON Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Dashboard test error:', error.message);
  });

  req.end();
}
