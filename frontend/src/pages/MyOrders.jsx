import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getPaymentStatus = (order) => {
    return order.isPaid ? 'Payment Successful' : 'Pending';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Placed': '#ffc107',
      'Confirmed': '#17a2b8',
      'Shipped': '#007bff',
      'Out for Delivery': '#6f42c1',
      'Delivered': '#28a745',
      'Cancelled': '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const getPaymentStatusColor = (isPaid) => {
    return isPaid ? '#28a745' : '#ffc107';
  };

  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
      if (!user) return;
      try {
        setLoading(true);
        setError('');

        const res = await fetch('/api/orders/myorders', {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const data = await res.json().catch(() => []);
        if (!res.ok) {
          throw new Error(data?.message || 'Failed to fetch orders');
        }

        if (isMounted) {
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        if (isMounted) setError(e?.message || 'Failed to fetch orders');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <>
      <div className="profile-page">
        <div className="profile-container">
          <h1 className="profile-title">My Orders</h1>

          {loading && <div style={{ padding: 12 }}>Loading...</div>}
          {!loading && error && (
            <div style={{ padding: 12, color: 'crimson' }}>
              {error}
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="empty-orders">
              <p>No orders yet</p>
              <Link to="/" className="shop-now-btn">
                Start Shopping
              </Link>
            </div>
          )}

          {!loading && !error && orders.length > 0 && (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <div>
                      <h3>Order #{String(order._id).slice(-6)}</h3>
                      <p className="order-date">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : ''}
                      </p>
                    </div>
                    <div className="order-status">
                      <span className={`status-badge ${order.orderStatus || ''}`} style={{ backgroundColor: getStatusColor(order.orderStatus) }}>
                        {order.orderStatus}
                      </span>
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: getPaymentStatusColor(order.isPaid), marginTop: '8px' }}
                      >
                        {getPaymentStatus(order)}
                      </span>
                      <p className="order-total">₹ {Number(order.totalPrice || 0).toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingTop: 10 }}>
                    <div style={{ opacity: 0.8 }}>
                      Items: {Array.isArray(order.orderItems) ? order.orderItems.length : 0}
                    </div>
                    <Link className="view-orders-btn" to={`/orders/${order._id}`}>
                      View / Track
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
