import { useState } from 'react';
import ProductCard from './ProductCard';

export default function Bedsheets() {

  // Sample bedsheet product data
  const [products] = useState([
    {
      id: 1,
      name: 'Floral Beige Cotton Bedsheet',
      price: 2799,
      image: '/1.jpg',
      size: 'Double',
      color: 'Beige',
      material: '100% Cotton',
      weave: 'Handloom',
      threadCount: '210 TC',
      sizes: ['Single', 'Double', 'Queen', 'King'],
      colors: ['Beige', 'Cream', 'White', 'Ivory'],
      includes: '1 Bedsheet + 2 Pillow Covers',
      care: 'Gentle hand wash / Dry clean'
    },
    {
      id: 2,
      name: 'Traditional Paisley Brown Bedsheet',
      price: 3299,
      image: '/2.jpg',
      size: 'Queen',
      color: 'Brown',
      material: '100% Cotton',
      weave: 'Handloom',
      threadCount: '250 TC',
      sizes: ['Double', 'Queen', 'King'],
      colors: ['Brown', 'Maroon', 'Tan', 'Coffee'],
      includes: '1 Bedsheet + 2 Pillow Covers',
      care: 'Gentle hand wash / Dry clean'
    },
    {
      id: 3,
      name: 'Geometric Maroon Handloom Bedsheet',
      price: 2999,
      image: '/3.jpg',
      size: 'King',
      color: 'Maroon',
      material: '100% Cotton',
      weave: 'Handloom',
      threadCount: '240 TC',
      sizes: ['Queen', 'King'],
      colors: ['Maroon', 'Burgundy', 'Red', 'Wine'],
      includes: '1 Bedsheet + 2 Pillow Covers',
      care: 'Gentle hand wash / Dry clean'
    },
    {
      id: 4,
      name: 'Classic Indigo Cotton Bedsheet',
      price: 3499,
      image: '/4.jpg',
      size: 'Double',
      color: 'Indigo',
      material: '100% Cotton',
      weave: 'Handloom',
      threadCount: '280 TC',
      sizes: ['Single', 'Double', 'Queen'],
      colors: ['Indigo', 'Navy', 'Blue', 'Royal Blue'],
      includes: '1 Bedsheet + 2 Pillow Covers',
      care: 'Gentle hand wash / Dry clean'
    },
    {
      id: 5,
      name: 'Elegant Olive Handloom Bedsheet',
      price: 2599,
      image: '/5.jpg',
      size: 'Single',
      color: 'Olive',
      material: '100% Cotton',
      weave: 'Handloom',
      threadCount: '220 TC',
      sizes: ['Single', 'Double'],
      colors: ['Olive', 'Green', 'Sage', 'Mint'],
      includes: '1 Bedsheet + 2 Pillow Covers',
      care: 'Gentle hand wash / Dry clean'
    },
    {
      id: 6,
      name: 'Premium Beige Cotton Bedsheet Set',
      price: 3999,
      image: '/7.jpg',
      size: 'King',
      color: 'Beige',
      material: '100% Cotton',
      weave: 'Handloom',
      threadCount: '300 TC',
      sizes: ['Queen', 'King'],
      colors: ['Beige', 'Cream', 'Ivory', 'Champagne'],
      includes: '1 Bedsheet + 2 Pillow Covers',
      care: 'Gentle hand wash / Dry clean'
    }
  ]);


  return (
    <div className="shop-page">
      <div className="shop-hero">
        <div className="shop-hero-overlay"></div>
        <h1 className="shop-title bedsheets-title">Cotton Bedsheets</h1>
      </div>

      <div className="shop-container">
        <div className="products-section">
          <div className="products-grid">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                category="bedsheets"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

