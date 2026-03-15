import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

export default function CustomizableCategories() {
  const navigate = useNavigate();

  const categories = [
    {
      id: 'carpets',
      title: 'Customizable Carpets',
      subtitle: 'Design Your Own',
      description: 'Premium handloom carpets in various sizes and colors. Add personal touches to your home.',
      image: '/carpet.jpg',
      path: '/design-carpet',
      texture: 'Handloom Weave',
      icon: '🏠'
    },
    {
      id: 'bedsheets',
      title: 'Customizable Bedsheets',
      subtitle: 'Design Your Own',
      description: 'Luxurious cotton bedsheets with custom sizing. Transform your bedroom with personalized designs.',
      image: '/1.jpg',
      path: '/design-bedsheet',
      texture: 'Premium Cotton',
      icon: '🛏️'
    },
    {
      id: 'bags',
      title: 'Customizable Bags',
      subtitle: 'Design Your Own',
      description: 'Create personalized bags with custom colors, text, and images. Perfect for gifts or personal use.',
      image: '/2.jpg',
      path: '/design-bag',
      texture: 'Cotton Fabric',
      icon: '👜'
    }
  ];

  const handleCategoryClick = (path) => {
    navigate(path);
  };

  return (
    <>
      <div className="customizable-categories-page">
        <div className="categories-hero">
          <h1 className="categories-main-title">Customizable Products</h1>
          <p className="categories-subtitle">Choose a category to start designing your perfect textile product</p>
        </div>

        <div className="categories-container">
          <div className="category-tiles-grid">
            {categories.map((category, index) => (
              <div
                key={category.id}
                className="category-tile"
                onClick={() => handleCategoryClick(category.path)}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="tile-image-wrapper">
                  <div className="tile-image-container">
                    <img 
                      src={category.image} 
                      alt={category.title}
                      className="tile-image"
                    />
                    <div className="tile-overlay"></div>
                    <div className="tile-texture-indicator">
                      <span className="texture-icon">🧵</span>
                      <span className="texture-text">{category.texture}</span>
                    </div>
                  </div>
                  
                  <div className="tile-content">
                    <div className="tile-icon">{category.icon}</div>
                    <h2 className="tile-title">{category.title}</h2>
                    <p className="tile-subtitle">{category.subtitle}</p>
                    <p className="tile-description">{category.description}</p>
                    
                    <div className="tile-cta">
                      <button className="tile-button">
                        Start Designing
                        <span className="arrow-icon">→</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="tile-shine-effect"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
