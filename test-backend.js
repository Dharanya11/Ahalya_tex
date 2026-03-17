// Test script to check backend connectivity
const testBackend = async () => {
  console.log('Testing backend connectivity...');
  
  try {
    // Test basic connectivity
    const response = await fetch('https://ahalya-tex-3.onrender.com/');
    console.log('Backend health check:', response.status);
    const text = await response.text();
    console.log('Backend response:', text);
    
    // Test API connectivity
    const apiResponse = await fetch('https://ahalya-tex-3.onrender.com/api/test');
    console.log('API health check:', apiResponse.status);
    const apiData = await apiResponse.json();
    console.log('API response:', apiData);
    
  } catch (error) {
    console.error('Backend test failed:', error);
  }
};

testBackend();
