// Debug script to check frontend environment and API calls
console.log('=== FRONTEND DEBUG ===');
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('All environment variables:', import.meta.env);

// Test API call
const testAPI = async () => {
  try {
    console.log('Testing API call to:', `${import.meta.env.VITE_API_URL || ''}/api/test`);
    
    const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    const data = await response.text();
    console.log('Response data:', data);
    
  } catch (error) {
    console.error('API test failed:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
  }
};

testAPI();
