import { useNavigate } from 'react-router-dom';

export default function CustomizableProducts() {
  const navigate = useNavigate();

  const customizableProducts = [
    {
      id: 'bags',
      name: 'Custom Bags',
      description: 'Design your perfect bag with personalized colors, text, and images',
      image: '/2.jpg',
      path: '/design-bag',
      badge: 'Customize'
    },
    {
      id: 'carpets',
      name: 'Handloom Carpets',
      description: 'Premium cotton carpets in various sizes and colors',
      image: '/carpet.jpg',
      path: '/category/carpets',
      badge: 'Customize'
    },
    {
      id: 'bedsheets',
      name: 'Cotton Bedsheets',
      description: 'Luxurious handloom bedsheets with custom sizing options',
      image: '/1.jpg',
      path: '/category/bedsheets',
      badge: 'Customize'
    }
  ];

  const handleProductClick = () => {
    navigate('/customizable-categories');
  };

  return (
    <section className="customizable-products-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Customizable Products</h2>
          <p className="section-subtitle">Create unique, personalized textile products tailored to your style</p>
        </div>
        
        <div className="customizable-grid">
          {customizableProducts.map((product) => (
            <div
              key={product.id}
              className="customizable-card"
              onClick={handleProductClick}
            >
              <div className="customizable-image-container">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="customizable-image"
                />
                <div className="customize-badge">{product.badge}</div>
                <div className="card-overlay">
                  <span className="explore-text">Explore →</span>
                </div>
              </div>
              
              <div className="customizable-card-content">
                <h3 className="customizable-card-title">{product.name}</h3>
                <p className="customizable-card-description">{product.description}</p>
                <button className="customizable-cta-btn">
                  Customize Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
