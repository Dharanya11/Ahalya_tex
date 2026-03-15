import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ImageCarousel from '../components/ImageCarousel';
import CustomizationModal from '../components/CustomizationModal';
import Footer from '../components/Footer';
import { getProductById } from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { addToRecentlyViewed } from '../utils/recentlyViewed';
import { calculateCustomizedUnitPrice } from '../utils/pricing';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const [customization, setCustomization] = useState({});

  useEffect(() => {
    const foundProduct = getProductById(id);
    if (foundProduct) {
      setProduct(foundProduct);
      addToRecentlyViewed(foundProduct);
      
      // Initialize customization with defaults
      if (foundProduct.customizable) {
        setCustomization({
          size: foundProduct.sizes?.[0] || 'Medium',
          color: foundProduct.colors?.[0] || 'Default',
          material: foundProduct.materials?.[0] || foundProduct.material || null,
          pattern: foundProduct.patterns?.[0] || null,
          threadCount: foundProduct.threadCounts?.[0] || null
        });
      }
    } else {
      navigate('/');
    }
  }, [id, navigate]);

  if (!product) {
    return <div className="loader-container"><div className="spinner"></div></div>;
  }

  const handleAddToCart = (customizationData = {}) => {
    const finalCustomization = { ...customization, ...customizationData };
    const finalPrice = calculateCustomizedUnitPrice(product, finalCustomization);
    
    addToCart(
      { ...product, price: finalPrice },
      finalCustomization,
      1
    );
    
    setShowCustomization(false);
    alert('Item added to cart!');
  };

  const handleBuyNow = () => {
    const unitPrice = calculateCustomizedUnitPrice(product, customization);
    const buyNowItem = {
      id: `${product.id}-buynow-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: unitPrice,
      image: product.image,
      quantity: 1,
      category: product.category || 'general',
      customizable: !!product.customizable,
      customization: {
        ...customization,
      },
    };
    navigate('/checkout', { state: { buyNowItem } });
  };

  const toggleWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const finalPrice = calculateCustomizedUnitPrice(product, customization);

  return (
    <>
      <div className="product-detail-page">
        <div className="product-detail-container">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>

          <div className="product-detail-content">
            <div className="product-detail-image-section">
              <ImageCarousel 
                images={product.images || [product.image]} 
                productName={product.name}
              />
              <button 
                className={`wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                onClick={toggleWishlist}
                title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {isInWishlist(product.id) ? '❤️' : '🤍'}
              </button>
            </div>

            <div className="product-detail-info">
              <h1 className="detail-product-name">{product.name}</h1>
              <p className="detail-product-price">₹{finalPrice.toLocaleString('en-IN')}</p>
              
              {product.customizable && (
                <p className="customizable-badge">✨ Customizable Product</p>
              )}

              <div className="product-specs">
                {product.description && (
                  <p><strong>Description:</strong> {product.description}</p>
                )}
                {product.material && (
                  <p><strong>Material:</strong> {product.material}</p>
                )}
                {product.weave && (
                  <p><strong>Weave:</strong> {product.weave}</p>
                )}
                {product.threadCount && (
                  <p><strong>Thread Count:</strong> {product.threadCount}</p>
                )}
                {product.care && (
                  <p><strong>Care Instructions:</strong> {product.care}</p>
                )}
              </div>

              {product.customizable ? (
                <div className="customization-section-detail">
                  <h3>Customization Options</h3>
                  <button 
                    className="customize-btn-large"
                    onClick={() => setShowCustomization(true)}
                  >
                    Customize & Add to Cart
                  </button>
                  <button className="buy-now-btn" onClick={handleBuyNow}>
                    Buy Now
                  </button>
                </div>
              ) : (
                <div className="quick-add-section">
                  <button 
                    className="add-to-cart-btn-large"
                    onClick={() => handleAddToCart()}
                  >
                    Add to Cart
                  </button>
                  <button className="buy-now-btn" onClick={handleBuyNow}>
                    Buy Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCustomization && product.customizable && (
        <CustomizationModal
          product={product}
          customization={customization}
          onCustomizationChange={setCustomization}
          onAddToCart={handleAddToCart}
          onClose={() => setShowCustomization(false)}
        />
      )}

      <Footer />
    </>
  );
}
