import React from 'react';
import DummyPayment from '../components/DummyPayment';
import OrdersPage from '../pages/OrdersPage';

// Example of how to integrate the dummy payment system
const PaymentIntegrationExample = () => {
  // Sample cart data
  const sampleCartItems = [
    {
      id: 'product1',
      name: 'Premium Cotton Shirt',
      price: 1299,
      quantity: 2,
      image: '/shirt.jpg'
    },
    {
      id: 'product2',
      name: 'Designer Jeans',
      price: 2499,
      quantity: 1,
      image: '/jeans.jpg'
    }
  ];

  // Sample user data
  const sampleUser = {
    id: 'user123',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 9876543210',
    address: '123 Main St, Mumbai, Maharashtra 400001',
    token: 'sample-jwt-token'
  };

  const totalPrice = sampleCartItems.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  const handlePaymentSuccess = (paymentResult) => {
    console.log('Payment successful:', paymentResult);
    // You can show a success notification here
    alert('Payment successful! Order placed successfully.');
  };

  const handleOrderCreated = (orderData) => {
    console.log('Order created:', orderData);
    // You can update your orders state here
    // The component will automatically redirect to orders page
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Payment Integration Example</h1>
      
      <div style={{ marginBottom: '40px' }}>
        <h2>Cart Summary:</h2>
        {sampleCartItems.map(item => (
          <div key={item.id} style={{ marginBottom: '10px' }}>
            {item.name} - {item.quantity} × ₹{item.price} = ₹{item.price * item.quantity}
          </div>
        ))}
        <h3>Total: ₹{totalPrice}</h3>
      </div>

      <DummyPayment
        cartItems={sampleCartItems}
        totalPrice={totalPrice}
        user={sampleUser}
        onPaymentSuccess={handlePaymentSuccess}
        onOrderCreated={handleOrderCreated}
      />
    </div>
  );
};

export default PaymentIntegrationExample;
