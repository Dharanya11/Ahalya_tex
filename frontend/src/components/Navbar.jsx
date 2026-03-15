import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import AdminSignupModal from './AdminSignupModal';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { getTotalItems } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const { wishlistCount } = useWishlist();

  const openLogin = () => {
    setIsLoginOpen(true);
    setIsSignupOpen(false);
  };

  const openSignup = () => {
    setIsSignupOpen(true);
    setIsLoginOpen(false);
  };

  const closeModals = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(false);
  };

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate('/');
  };

  const cartItemCount = getTotalItems();
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="navbar">
        <div className="brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <h2 className="shining-text">Shri <span className="ahalya-tex">Ahalya Tex</span></h2>
          <p className="sub-text">Quality Tradition</p>
        </div>

        <ul>
          <li 
            className={isActive('/') ? 'active' : ''}
            onClick={() => navigate('/')}
          >
            Home
          </li>
          {!isAuthenticated ? (
            <>
              <li 
                className="nav-button"
                onClick={openLogin}
              >
                Login
              </li>
              <li 
                className="nav-button"
                onClick={openSignup}
              >
                Signup
              </li>
            </>
          ) : (
            <li 
              className="nav-button"
              onClick={() => navigate('/profile')}
            >
              Profile
            </li>
          )}
          {isAuthenticated && (user?.role === 'admin' || user?.isAdmin) && (
            <li
              className="nav-button"
              onClick={() => navigate('/admin')}
            >
              Admin
            </li>
          )}
        </ul>

        <div className="icons">
          <span 
            className="icon wishlist-icon" 
            onClick={() => navigate('/profile?tab=wishlist')}
            title="Wishlist"
          >
            ❤️
            {wishlistCount > 0 && (
              <span className="cart-badge">{wishlistCount}</span>
            )}
          </span>
          <span 
            className="icon cart-icon" 
            onClick={() => navigate('/cart')}
            title="Cart"
          >
            🛒
            {cartItemCount > 0 && (
              <span className="cart-badge">{cartItemCount}</span>
            )}
          </span>
          {isAuthenticated && (
            <div className="profile-menu-container">
              <span 
                className="icon profile-icon" 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                title="Profile"
              >
                👤
              </span>
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <p className="profile-name">{user?.name}</p>
                    <p className="profile-email">{user?.email}</p>
                  </div>
                  <Link to="/profile" className="profile-dropdown-item" onClick={() => setShowProfileMenu(false)}>
                    My Profile
                  </Link>
                  {(user?.role === 'admin' || user?.isAdmin) && (
                    <Link to="/admin/dashboard" className="profile-dropdown-item" onClick={() => setShowProfileMenu(false)}>
                      Admin Dashboard
                    </Link>
                  )}
                  <Link to="/customer/dashboard" className="profile-dropdown-item" onClick={() => setShowProfileMenu(false)}>
                    Customer Dashboard
                  </Link>
                  <Link to="/profile?tab=orders" className="profile-dropdown-item" onClick={() => setShowProfileMenu(false)}>
                    Orders
                  </Link>
                  <Link to="/profile?tab=wishlist" className="profile-dropdown-item" onClick={() => setShowProfileMenu(false)}>
                    Wishlist
                  </Link>
                  <button className="profile-dropdown-item logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={closeModals} 
        onSwitchToSignup={openSignup}
      />
      <SignupModal 
        isOpen={isSignupOpen} 
        onClose={closeModals}
        onSwitchToLogin={openLogin}
      />
    </>
  );
}
