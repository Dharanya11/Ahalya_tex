import { useNavigate } from 'react-router-dom';

export default function Categories() {
  const navigate = useNavigate();
  
  // Define category items with their corresponding page routes and images
  const items = [
    { name: "Cotton Carpets", path: "/category/carpets", image: "/carpet.jpg" },
    { name: "Bedsheets", path: "/category/bedsheets", image: "/1.jpg" },
    { name: "Bags", path: "/category/bags", image: "/2.jpg" }
  ];

  // Second row cards with images
  const secondRowItems = [
    { name: "Customized Products", path: "/design-bag", image: "/3.jpg" },
    { name: "Best Sellers", path: "/category/carpets", image: "/4.jpg" }
  ];
  
  // Handle category button click - routes to appropriate page
  const handleCategoryClick = (path) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <div className="categories-section">
      <div className="grid">
        {items.map(item => (
          <div className="card" key={item.name}>
            <div className="card-image-container">
              <img src={item.image} alt={item.name} className="card-image" />
            </div>
            <h3>{item.name}</h3>
            <button 
              onClick={() => handleCategoryClick(item.path)}
              type="button"
            >
              Shop Now
            </button>
          </div>
        ))}
      </div>
      
      <div className="second-row">
        {secondRowItems.map(item => (
          <div className="second-card" key={item.name}>
            <div className="card-image-container">
              <img src={item.image} alt={item.name} className="card-image" />
            </div>
            <h3>{item.name}</h3>
            <button 
              onClick={() => handleCategoryClick(item.path)}
              type="button"
            >
              {item.name === "Customized Products" ? "Create Your Own" : "Most Popular Items"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
