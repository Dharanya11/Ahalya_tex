import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import Delivery from '../components/Delivery';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { getFeaturedProducts } from '../data/products';

export default function Home() {
  const featuredProducts = getFeaturedProducts();
  const location = useLocation();
  const [redirectMessage, setRedirectMessage] = useState(null);

  // Show error when redirected (e.g. unauthorized admin access)
  useEffect(() => {
    if (location.state?.message) {
      setRedirectMessage(location.state.message);
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location]);

  return (
    <>
      {redirectMessage && (
        <div className="auth-message-banner" role="alert">
          {redirectMessage}
          <button type="button" onClick={() => setRedirectMessage(null)} aria-label="Dismiss">×</button>
        </div>
      )}
      <Hero />
      <Categories />
      
      {/* Featured Products Section */}
      <section className="featured-section">
        <div className="container">
          <h2 className="section-title">Featured Products</h2>
          <div className="products-grid">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} category={product.category} />
            ))}
          </div>
          <div className="section-footer">
            <Link to="/shop" className="view-all-btn">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      <Delivery />
      <Footer />
    </>
  );
}
