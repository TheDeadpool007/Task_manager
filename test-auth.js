const fetch = require('node-fetch');

async function testRegistration() {
  try {
    const response = await fetch('http://localhost:3002/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      })
    });

    const data = await response.json();
    console.log('Registration Test Result:');
    console.log('Status:', response.status);
    console.log('Response:', data);
  } catch (error) {
    console.error('Error testing registration:', error.message);
  }
}

async function testLogin() {
  try {
    const response = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    const data = await response.json();
    console.log('\nLogin Test Result:');
    console.log('Status:', response.status);
    console.log('Response:', data);
  } catch (error) {
    console.error('Error testing login:', error.message);
  }
}

// Run tests
testRegistration().then(() => {
  setTimeout(testLogin, 1000);
});
