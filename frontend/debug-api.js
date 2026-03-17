// Debug script to test API responses
const testAPI = async () => {
  console.log('Testing API connection...');
  
  try {
    const response = await fetch('https://ahalya-tex-3.onrender.com/api/test');
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    const text = await response.text();
    console.log('Raw response:', text);
    
    if (contentType && contentType.includes('application/json')) {
      const json = JSON.parse(text);
      console.log('Parsed JSON:', json);
    } else {
      console.error('Response is not JSON:', text);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
};

const testAuth = async () => {
  console.log('Testing auth endpoint...');
  
  try {
    const response = await fetch('https://ahalya-tex-3.onrender.com/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'TestUser',
        email: 'test@example.com',
        password: 'test123'
      })
    });
    
    console.log('Auth Response status:', response.status);
    console.log('Auth Response headers:', [...response.headers.entries()]);
    
    const contentType = response.headers.get('content-type');
    console.log('Auth Content-Type:', contentType);
    
    const text = await response.text();
    console.log('Auth Raw response:', text);
    
    if (contentType && contentType.includes('application/json')) {
      const json = JSON.parse(text);
      console.log('Auth Parsed JSON:', json);
    } else {
      console.error('Auth Response is not JSON:', text);
    }
  } catch (error) {
    console.error('Auth test failed:', error);
  }
};

// Run tests
testAPI();
testAuth();
