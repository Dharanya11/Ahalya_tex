import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { calculateCustomizedUnitPrice } from '../utils/pricing';

export default function ProductCard({ product, category = 'general' }) {
  const navigate = useNavigate();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleViewDetails = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${product.id}`);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const unitPrice = calculateCustomizedUnitPrice(product, {});
    const buyNowItem = {
      id: `${product.id}-buynow-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: unitPrice,
      image: product.image,
      quantity: 1,
      category: product.category || category,
      customizable: !!product.customizable,
      customization: {},
    };
    navigate('/checkout', { state: { buyNowItem } });
  };

  const price = product.price || product.basePrice || 0;

  return (
    <div className="product-card" onClick={handleCardClick}>
      <div className="product-image-container">
        <img 
          src={product.image || '/hero.png'} 
          alt={product.name}
          className="product-image"
        />
        <button 
          className={`wishlist-btn-card ${isInWishlist(product.id) ? 'active' : ''}`}
          onClick={toggleWishlist}
          title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isInWishlist(product.id) ? '❤️' : '🤍'}
        </button>
        {product.customizable && (
          <span className="customizable-badge-card">✨ Custom</span>
        )}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">₹ {price.toLocaleString('en-IN')}</p>
        <button 
          className="view-details-btn"
          onClick={handleViewDetails}
        >
          View Details
        </button>
        <button className="buy-now-btn-card" onClick={handleBuyNow}>
          Buy Now
        </button>
      </div>
    </div>
  );
}
