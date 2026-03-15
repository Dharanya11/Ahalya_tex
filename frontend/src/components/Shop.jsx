import { useState } from 'react';
import ProductCard from './ProductCard';

export default function Shop() {

  // Sample product data
  const [products] = useState([
    {
      id: 1,
      name: 'Paisley Red Cotton Carpet',
      price: 2500,
      image: '/red.jpg',
      size: 'Medium',
      color: 'Red',
      material: '100% Cotton',
      weave: 'Handloom',
      sizes: ['Small', 'Medium', 'Large'],
      colors: ['Red', 'Blue', 'Green', 'Brown'],
      care: 'Hand wash / Dry clean'
    },
    {
      id: 2,
      name: 'Traditional Beige Handloom Carpet',
      price: 3200,
      image: '/beige.jpg',
      size: 'Large',
      color: 'Beige',
      material: '100% Cotton',
      weave: 'Handloom',
      sizes: ['Medium', 'Large'],
      colors: ['Beige', 'Cream', 'White'],
      care: 'Hand wash / Dry clean'
    },
    {
      id: 3,
      name: 'Geometric Brown Cotton Carpet',
      price: 2800,
      image: '/brown.jpg',
      size: 'Small',
      color: 'Brown',
      material: '100% Cotton',
      weave: 'Handloom',
      sizes: ['Small', 'Medium', 'Large'],
      colors: ['Brown', 'Maroon', 'Dark Brown'],
      care: 'Hand wash / Dry clean'
    },
    {
      id: 4,
      name: 'Floral Blue Handloom Carpet',
      price: 3500,
      image: '/blue.jpg',
      size: 'Large',
      color: 'Blue',
      material: '100% Cotton',
      weave: 'Handloom',
      sizes: ['Medium', 'Large'],
      colors: ['Blue', 'Navy', 'Indigo'],
      care: 'Hand wash / Dry clean'
    },
    {
      id: 5,
      name: 'Classic Green Cotton Carpet',
      price: 2200,
      image: '/green.jpg',
      size: 'Medium',
      color: 'Green',
      material: '100% Cotton',
      weave: 'Handloom',
      sizes: ['Small', 'Medium'],
      colors: ['Green', 'Olive', 'Mint'],
      care: 'Hand wash / Dry clean'
    },
    {
      id: 6,
      name: 'Elegant Brown Paisley Carpet',
      price: 4000,
      image: '/6.jpg',
      size: 'Large',
      color: 'Brown',
      material: '100% Cotton',
      weave: 'Handloom',
      sizes: ['Large'],
      colors: ['Brown', 'Tan', 'Beige'],
      care: 'Hand wash / Dry clean'
    }
  ]);


  return (
    <div className="shop-page">
      <div className="shop-hero">
        <div className="shop-hero-overlay"></div>
        <h1 className="shop-title">Cotton Carpets</h1>
      </div>

      <div className="shop-container">
        <div className="products-section">
          <div className="products-grid">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                category="carpets"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
