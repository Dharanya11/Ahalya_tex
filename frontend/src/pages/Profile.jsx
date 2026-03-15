import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { getRecentlyViewed, removeFromRecentlyViewed } from '../utils/recentlyViewed';

export default function Profile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const { wishlist, clearWishlist } = useWishlist();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [orders, setOrders] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || ''
  });

  // Handle removing item from recently viewed
  const handleRemoveFromRecentlyViewed = (productId) => {
    const updated = removeFromRecentlyViewed(productId);
    setRecentlyViewed(updated);
  };

  // Handle profile edit
  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form if canceling
      setEditForm({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        city: user?.city || '',
        state: user?.state || '',
        pincode: user?.pincode || ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        // Update user context
        // Note: You'll need to implement this in your AuthContext
        alert('Profile updated successfully!');
        setIsEditing(false);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  useEffect(() => {
    // Load orders from backend
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders/myorders', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    if (user) {
      fetchOrders();
    }

    // Load recently viewed
    const recent = getRecentlyViewed();
    setRecentlyViewed(recent);
  }, [user]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  if (!user) {
    return (
      <>
        <div className="profile-page">
          <div className="profile-empty">
            <h2>Please login to view your profile</h2>
            <button onClick={() => navigate('/')}>Go to Home</button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <div className="profile-page">
        <div className="profile-container">
          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-avatar-section">
              <div className="profile-avatar">
                <img 
                  src={user?.avatar || '/default-avatar.png'} 
                  alt="Profile"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="avatar-fallback">
                  {(user?.name || 'U').slice(0, 1).toUpperCase()}
                </div>
              </div>
              <button className="change-avatar-btn">
                📷 Change Photo
              </button>
            </div>
            
            <div className="profile-info">
              <h1 className="profile-title">{user?.name || 'User'}</h1>
              <p className="profile-subtitle">{user?.email || 'user@example.com'}</p>
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-number">{orders.length}</span>
                  <span className="stat-label">Orders</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{wishlist.length}</span>
                  <span className="stat-label">Wishlist</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{recentlyViewed.length}</span>
                  <span className="stat-label">Recently Viewed</span>
                </div>
              </div>
            </div>
            
            <div className="profile-actions">
              <button className="edit-profile-btn" onClick={handleEditToggle}>
                {isEditing ? 'Cancel' : '✏️ Edit Profile'}
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          </div>

          {/* Profile Content */}
          <div className="profile-content">
            {/* Sidebar Navigation */}
            <div className="profile-sidebar">
              <nav className="profile-nav">
                <button 
                  className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  👤 Personal Info
                </button>
                <button 
                  className={`nav-item ${activeTab === 'address' ? 'active' : ''}`}
                  onClick={() => setActiveTab('address')}
                >
                  📍 Address
                </button>
                <button 
                  className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('orders')}
                >
                  📦 Orders
                </button>
                <button 
                  className={`nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}
                  onClick={() => setActiveTab('wishlist')}
                >
                  ❤️ Wishlist
                </button>
                <button 
                  className={`nav-item ${activeTab === 'recent' ? 'active' : ''}`}
                  onClick={() => setActiveTab('recent')}
                >
                  👁️ Recently Viewed
                </button>
                <button 
                  className={`nav-item ${activeTab === 'password' ? 'active' : ''}`}
                  onClick={() => setActiveTab('password')}
                >
                  🔒 Password
                </button>
              </nav>
            </div>

            {/* Main Content Area */}
            <div className="profile-main">
              {/* Personal Info Section */}
              {activeTab === 'profile' && (
                <div className="profile-section">
                  <div className="section-header">
                    <h2>Personal Information</h2>
                    {isEditing && (
                      <div className="edit-actions">
                        <button className="save-btn" onClick={handleSaveProfile}>
                          💾 Save
                        </button>
                        <button className="cancel-btn" onClick={handleEditToggle}>
                          ❌ Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="profile-form">
                    <div className="form-row">
                      <label>Full Name:</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={editForm.name}
                          onChange={handleEditChange}
                          className="form-input"
                        />
                      ) : (
                        <span>{user?.name || 'Not provided'}</span>
                      )}
                    </div>
                    
                    <div className="form-row">
                      <label>Email:</label>
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={editForm.email}
                          onChange={handleEditChange}
                          className="form-input"
                        />
                      ) : (
                        <span>{user?.email || 'Not provided'}</span>
                      )}
                    </div>
                    
                    <div className="form-row">
                      <label>Phone:</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={editForm.phone}
                          onChange={handleEditChange}
                          className="form-input"
                        />
                      ) : (
                        <span>{user?.phone || 'Not provided'}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Address Section */}
              {activeTab === 'address' && (
                <div className="profile-section">
                  <div className="section-header">
                    <h2>Address Information</h2>
                    {isEditing && (
                      <div className="edit-actions">
                        <button className="save-btn" onClick={handleSaveProfile}>
                          💾 Save
                        </button>
                        <button className="cancel-btn" onClick={handleEditToggle}>
                          ❌ Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="profile-form">
                    <div className="form-row">
                      <label>Address:</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="address"
                          value={editForm.address}
                          onChange={handleEditChange}
                          className="form-input"
                        />
                      ) : (
                        <span>{user?.address || 'Not provided'}</span>
                      )}
                    </div>
                    
                    <div className="form-row">
                      <label>City:</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="city"
                          value={editForm.city}
                          onChange={handleEditChange}
                          className="form-input"
                        />
                      ) : (
                        <span>{user?.city || 'Not provided'}</span>
                      )}
                    </div>
                    
                    <div className="form-row">
                      <label>State:</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="state"
                          value={editForm.state}
                          onChange={handleEditChange}
                          className="form-input"
                        />
                      ) : (
                        <span>{user?.state || 'Not provided'}</span>
                      )}
                    </div>
                    
                    <div className="form-row">
                      <label>Pincode:</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="pincode"
                          value={editForm.pincode}
                          onChange={handleEditChange}
                          className="form-input"
                        />
                      ) : (
                        <span>{user?.pincode || 'Not provided'}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Orders Section */}
              {activeTab === 'orders' && (
                <div className="profile-section">
                  <h2>Order History</h2>
                  {orders.length === 0 ? (
                    <div className="empty-state">
                      <p>No orders yet</p>
                      <button onClick={() => navigate('/')}>Start Shopping</button>
                    </div>
                  ) : (
                    <div className="orders-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map(order => (
                            <tr key={order._id}>
                              <td>#{order._id.slice(-8)}</td>
                              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                              <td>{order.orderItems?.length || 0}</td>
                              <td>₹{order.totalPrice?.toLocaleString('en-IN')}</td>
                              <td>
                                <span className={`status ${order.status}`}>
                                  {order.status}
                                </span>
                              </td>
                              <td>
                                <button className="view-btn">
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Wishlist Section */}
              {activeTab === 'wishlist' && (
                <div className="profile-section">
                  <h2>My Wishlist</h2>
                  {wishlist.length === 0 ? (
                    <div className="empty-state">
                      <p>Your wishlist is empty</p>
                      <button onClick={() => navigate('/')}>Browse Products</button>
                    </div>
                  ) : (
                    <div className="wishlist-grid">
                      {wishlist.map(item => (
                        <ProductCard key={item.id} product={item} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Recently Viewed Section */}
              {activeTab === 'recent' && (
                <div className="profile-section">
                  <h2>Recently Viewed</h2>
                  {recentlyViewed.length === 0 ? (
                    <div className="empty-state">
                      <p>No recently viewed products</p>
                      <button onClick={() => navigate('/')}>Browse Products</button>
                    </div>
                  ) : (
                    <div className="recently-viewed-grid">
                      {recentlyViewed.map(product => (
                        <div key={product.id} className="recently-viewed-item">
                          <button 
                            className="remove-recent-btn"
                            onClick={() => handleRemoveFromRecentlyViewed(product.id)}
                            title="Remove from recently viewed"
                          >
                            ×
                          </button>
                          <ProductCard 
                            product={product} 
                            category={product.category} 
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Password Section */}
              {activeTab === 'password' && (
                <div className="profile-section">
                  <h2>Change Password</h2>
                  <div className="password-form">
                    <div className="form-row">
                      <label>Current Password:</label>
                      <input type="password" className="form-input" />
                    </div>
                    <div className="form-row">
                      <label>New Password:</label>
                      <input type="password" className="form-input" />
                    </div>
                    <div className="form-row">
                      <label>Confirm New Password:</label>
                      <input type="password" className="form-input" />
                    </div>
                    <button className="change-password-btn">
                      🔒 Change Password
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
