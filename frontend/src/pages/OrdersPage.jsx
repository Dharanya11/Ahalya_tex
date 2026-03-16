import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrdersPage.css';

const OrdersPage = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from backend API first
      if (user?.token) {
        const response = await fetch('/api/orders/myorders', {
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setOrders(data);
          setLoading(false);
          return;
        }
      }

      // Fallback to localStorage
      const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const userOrders = user?.id 
        ? localOrders.filter(order => order.user.id === user.id)
        : localOrders;
      
      setOrders(userOrders.reverse()); // Show newest first
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return '#ffc107';
      case 'shipped':
        return '#17a2b8';
      case 'delivered':
        return '#28a745';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return '⏳';
      case 'shipped':
        return '🚚';
      case 'delivered':
        return '✅';
      case 'cancelled':
        return '❌';
      default:
        return '📦';
    }
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Error Loading Orders</h2>
          <p>{error}</p>
          <button onClick={fetchOrders} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <button 
            className="continue-shopping-btn"
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">📦</div>
            <h2>No Orders Yet</h2>
            <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
            <button 
              className="shop-now-btn"
              onClick={() => navigate('/')}
            >
              Shop Now
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header-info">
                  <div className="order-id-section">
                    <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
                    <p className="order-date">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="order-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.orderStatus) }}
                    >
                      {getStatusIcon(order.orderStatus)} {order.orderStatus}
                    </span>
                  </div>
                </div>

                <div className="order-items">
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="item-info">
                        <h4>{item.name}</h4>
                        <p>Quantity: {item.quantity}</p>
                      </div>
                      <div className="item-price">
                        {formatPrice(item.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-summary">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>{formatPrice(order.totalPrice)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Delivery:</span>
                    <span>FREE</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>{formatPrice(order.totalPrice)}</span>
                  </div>
                </div>

                <div className="order-payment-info">
                  <div className="payment-detail">
                    <span className="label">Payment Method:</span>
                    <span className="value">{order.paymentDetails.method}</span>
                  </div>
                  <div className="payment-detail">
                    <span className="label">Payment Status:</span>
                    <span className="value paid">{order.paymentDetails.status}</span>
                  </div>
                  <div className="payment-detail">
                    <span className="label">Payment ID:</span>
                    <span className="value">{order.paymentDetails.paymentId}</span>
                  </div>
                </div>

                <div className="order-actions">
                  <button className="view-details-btn">
                    View Details
                  </button>
                  <button className="track-order-btn">
                    Track Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
