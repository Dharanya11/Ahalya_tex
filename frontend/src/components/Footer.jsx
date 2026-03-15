import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="ah-footer" aria-label="Ahalya Tex footer">
      <div className="ah-footer__container">
        <div className="ah-footer__grid">
          <section className="ah-footer__col" aria-label="Brand information">
            <div className="ah-footer__brand">Ahalya Tex</div>
            <div className="ah-footer__tagline">Premium Sarees &amp; Ethnic Wear</div>
            <p className="ah-footer__desc">
              Explore traditional silk, soft cotton, bridal collections, and elegant ethnic wear crafted with premium quality
              fabrics—where heritage meets modern style.
            </p>
          </section>

          <nav className="ah-footer__col" aria-label="Quick links">
            <h4 className="ah-footer__title">Quick Links</h4>
            <ul className="ah-footer__list">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/shop">Shop</Link></li>
              <li><Link to="/customizable-categories">Categories</Link></li>
              <li><Link to="/shop?filter=new">New Arrivals</Link></li>
              <li><Link to="/shop?filter=best">Best Sellers</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><a href="/reviews.html">Customer Reviews</a></li>
              <li><a href="/track-order.html">Track Order</a></li>
            </ul>
          </nav>

          <nav className="ah-footer__col" aria-label="Customer support">
            <h4 className="ah-footer__title">Customer Support</h4>
            <ul className="ah-footer__list">
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/shipping">Shipping &amp; Delivery</Link></li>
              <li><Link to="/return-policy">Return &amp; Refund Policy</Link></li>
              <li><Link to="/cancellation">Cancellation Policy</Link></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms &amp; Conditions</Link></li>
            </ul>
          </nav>

          <section className="ah-footer__col" aria-label="Contact information">
            <h4 className="ah-footer__title">Contact Info</h4>
            <address className="ah-footer__info">
              <div>
                <strong>Address:</strong>
                <div>Ahalya Tex,</div>
                <div>Textile Street,</div>
                <div>Coimbatore, Tamil Nadu, India</div>
              </div>

              <div>
                <strong>Phone:</strong>{' '}
                <a href="tel:+919876543210" className="ah-footer__link">+91 98765 43210</a>
              </div>

              <div>
                <strong>Email:</strong>{' '}
                <a href="mailto:support@ahalyatex.com" className="ah-footer__link">support@ahalyatex.com</a>
              </div>

              <div>
                <strong>Working hours:</strong>
                <div>Mon–Sat (9:30 AM – 8:30 PM)</div>
              </div>
            </address>

            <div className="ah-footer__social" aria-label="Social media">
              <a className="ah-footer__socialLink" href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H8.1V12h2.3V9.8c0-2.3 1.4-3.6 3.5-3.6 1 0 2 .2 2 .2v2.2h-1.1c-1.1 0-1.4.7-1.4 1.4V12h2.4l-.4 2.9h-2v7A10 10 0 0 0 22 12z"/>
                </svg>
              </a>
              <a className="ah-footer__socialLink" href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 4.5A5.5 5.5 0 1 1 6.5 14 5.5 5.5 0 0 1 12 8.5zm0 2A3.5 3.5 0 1 0 15.5 14 3.5 3.5 0 0 0 12 10.5zM18 6.8a1 1 0 1 1-1 1 1 1 0 0 1 1-1z"/>
                </svg>
              </a>
              <a className="ah-footer__socialLink" href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.9-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 1 1 12 20zm4.6-5.3c-.2-.1-1.4-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.6 6.6 0 0 1-3.9-3.4c-.1-.2 0-.4.1-.5l.4-.5c.1-.1.1-.3.2-.4a.5.5 0 0 0 0-.5c-.1-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.8.4 3.2 3.2 0 0 0-1 2.3 5.6 5.6 0 0 0 1.2 3 12.7 12.7 0 0 0 4.9 4.3 5.6 5.6 0 0 0 3.1.9 2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.2c-.1-.1-.2-.2-.4-.3z"/>
                </svg>
              </a>
              <a className="ah-footer__socialLink" href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-2C18 4.7 12 4.7 12 4.7s-6 0-7.7.5a2.7 2.7 0 0 0-1.9 2A28 28 0 0 0 2 12a28 28 0 0 0 .4 4.8 2.7 2.7 0 0 0 1.9 2c1.7.5 7.7.5 7.7.5s6 0 7.7-.5a2.7 2.7 0 0 0 1.9-2A28 28 0 0 0 22 12a28 28 0 0 0-.4-4.8zM10 15.5v-7l6 3.5-6 3.5z"/>
                </svg>
              </a>
            </div>
          </section>
        </div>

        <div className="ah-footer__divider" role="separator" />

        <div className="ah-footer__bottom">
          <small>© 2026 Ahalya Tex. All Rights Reserved.</small>
        </div>
      </div>
    </footer>
  );
}
