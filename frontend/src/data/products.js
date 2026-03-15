// Complete product data structure
// Each category: 6 normal products + 3 customizable products

export const products = {
  carpets: {
    normal: [
      {
        id: 'carpet-1',
        name: 'Paisley Red Cotton Carpet',
        price: 2500,
        image: '/red.jpg',
        images: ['/red.jpg', '/carpet.jpg'],
        size: 'Medium',
        color: 'Red',
        material: '100% Cotton',
        weave: 'Handloom',
        sizes: ['Small', 'Medium', 'Large'],
        colors: ['Red', 'Blue', 'Green', 'Brown'],
        care: 'Hand wash / Dry clean',
        description: 'Beautiful handloom carpet with traditional paisley design in vibrant red.',
        category: 'carpets',
        customizable: false
      },
      {
        id: 'carpet-2',
        name: 'Traditional Beige Handloom Carpet',
        price: 3200,
        image: '/beige.jpg',
        images: ['/beige.jpg', '/carpet.jpg'],
        size: 'Large',
        color: 'Beige',
        material: '100% Cotton',
        weave: 'Handloom',
        sizes: ['Medium', 'Large'],
        colors: ['Beige', 'Cream', 'White'],
        care: 'Hand wash / Dry clean',
        description: 'Elegant beige carpet perfect for modern interiors.',
        category: 'carpets',
        customizable: false
      },
      {
        id: 'carpet-3',
        name: 'Geometric Brown Cotton Carpet',
        price: 2800,
        image: '/brown.jpg',
        images: ['/brown.jpg', '/carpet.jpg'],
        size: 'Small',
        color: 'Brown',
        material: '100% Cotton',
        weave: 'Handloom',
        sizes: ['Small', 'Medium', 'Large'],
        colors: ['Brown', 'Maroon', 'Dark Brown'],
        care: 'Hand wash / Dry clean',
        description: 'Modern geometric pattern in rich brown tones.',
        category: 'carpets',
        customizable: false
      },
      {
        id: 'carpet-4',
        name: 'Floral Blue Handloom Carpet',
        price: 3500,
        image: '/blue.jpg',
        images: ['/blue.jpg', '/carpet.jpg'],
        size: 'Large',
        color: 'Blue',
        material: '100% Cotton',
        weave: 'Handloom',
        sizes: ['Medium', 'Large'],
        colors: ['Blue', 'Navy', 'Indigo'],
        care: 'Hand wash / Dry clean',
        description: 'Stunning floral design in calming blue shades.',
        category: 'carpets',
        customizable: false
      },
      {
        id: 'carpet-5',
        name: 'Classic Green Cotton Carpet',
        price: 2200,
        image: '/green.jpg',
        images: ['/green.jpg', '/carpet.jpg'],
        size: 'Medium',
        color: 'Green',
        material: '100% Cotton',
        weave: 'Handloom',
        sizes: ['Small', 'Medium'],
        colors: ['Green', 'Olive', 'Mint'],
        care: 'Hand wash / Dry clean',
        description: 'Fresh green carpet bringing nature indoors.',
        category: 'carpets',
        customizable: false
      },
      {
        id: 'carpet-6',
        name: 'Elegant Brown Paisley Carpet',
        price: 4000,
        image: '/6.jpg',
        images: ['/6.jpg', '/carpet.jpg'],
        size: 'Large',
        color: 'Brown',
        material: '100% Cotton',
        weave: 'Handloom',
        sizes: ['Large'],
        colors: ['Brown', 'Tan', 'Beige'],
        care: 'Hand wash / Dry clean',
        description: 'Premium paisley design in sophisticated brown.',
        category: 'carpets',
        customizable: false
      }
    ],
    customizable: [
      {
        id: 'carpet-custom-1',
        name: 'Custom Handloom Carpet',
        basePrice: 3000,
        price: 3000,
        image: '/carpet.jpg',
        images: ['/carpet.jpg', '/red.jpg', '/beige.jpg'],
        sizes: ['Small', 'Medium', 'Large', 'Extra Large'],
        colors: ['Red', 'Blue', 'Green', 'Brown', 'Beige', 'Cream'],
        patterns: ['Paisley', 'Geometric', 'Floral', 'Traditional', 'Modern'],
        materials: ['100% Cotton', 'Cotton-Wool Blend', 'Premium Cotton'],
        description: 'Create your perfect custom carpet with your choice of size, color, pattern, and material.',
        category: 'carpets',
        customizable: true
      },
      {
        id: 'carpet-custom-2',
        name: 'Premium Custom Carpet',
        basePrice: 4500,
        price: 4500,
        image: '/carpet.jpg',
        images: ['/carpet.jpg', '/brown.jpg', '/blue.jpg'],
        sizes: ['Medium', 'Large', 'Extra Large'],
        colors: ['Brown', 'Beige', 'Cream', 'Navy', 'Maroon'],
        patterns: ['Traditional', 'Paisley', 'Geometric', 'Floral'],
        materials: ['Premium Cotton', 'Cotton-Wool Blend', 'Luxury Blend'],
        description: 'Premium quality custom carpet with enhanced durability and luxury feel.',
        category: 'carpets',
        customizable: true
      },
      {
        id: 'carpet-custom-3',
        name: 'Designer Custom Carpet',
        basePrice: 5500,
        price: 5500,
        image: '/carpet.jpg',
        images: ['/carpet.jpg', '/green.jpg', '/6.jpg'],
        sizes: ['Large', 'Extra Large'],
        colors: ['Red', 'Blue', 'Green', 'Brown', 'Beige', 'Cream', 'Navy'],
        patterns: ['Modern', 'Geometric', 'Floral', 'Abstract'],
        materials: ['Luxury Blend', 'Premium Cotton', 'Designer Collection'],
        description: 'Top-tier designer carpet with exclusive patterns and premium materials.',
        category: 'carpets',
        customizable: true
      }
    ]
  },
  bedsheets: {
    normal: [
      {
        id: 'bedsheet-1',
        name: 'Classic Cotton Bedsheet Set',
        price: 1200,
        image: '/1.jpg',
        images: ['/1.jpg', '/2.jpg'],
        size: 'Queen',
        color: 'White',
        material: '100% Cotton',
        threadCount: '200',
        sizes: ['Single', 'Double', 'Queen', 'King'],
        colors: ['White', 'Cream', 'Beige'],
        care: 'Machine washable',
        description: 'Soft and comfortable cotton bedsheet set for a good night\'s sleep.',
        category: 'bedsheets',
        customizable: false
      },
      {
        id: 'bedsheet-2',
        name: 'Premium Cotton Bedsheet',
        price: 1800,
        image: '/2.jpg',
        images: ['/2.jpg', '/3.jpg'],
        size: 'King',
        color: 'Cream',
        material: '100% Premium Cotton',
        threadCount: '300',
        sizes: ['Double', 'Queen', 'King'],
        colors: ['Cream', 'Beige', 'Ivory'],
        care: 'Machine washable',
        description: 'Luxurious premium cotton with higher thread count for ultimate comfort.',
        category: 'bedsheets',
        customizable: false
      },
      {
        id: 'bedsheet-3',
        name: 'Printed Cotton Bedsheet',
        price: 1500,
        image: '/3.jpg',
        images: ['/3.jpg', '/4.jpg'],
        size: 'Queen',
        color: 'Blue',
        material: '100% Cotton',
        threadCount: '200',
        sizes: ['Single', 'Double', 'Queen'],
        colors: ['Blue', 'Pink', 'Green'],
        care: 'Machine washable',
        description: 'Beautiful printed design adding style to your bedroom.',
        category: 'bedsheets',
        customizable: false
      },
      {
        id: 'bedsheet-4',
        name: 'Striped Cotton Bedsheet',
        price: 1400,
        image: '/4.jpg',
        images: ['/4.jpg', '/5.jpg'],
        size: 'Double',
        color: 'Multi',
        material: '100% Cotton',
        threadCount: '200',
        sizes: ['Single', 'Double', 'Queen'],
        colors: ['Multi', 'Blue-White', 'Red-White'],
        care: 'Machine washable',
        description: 'Classic striped pattern for timeless bedroom elegance.',
        category: 'bedsheets',
        customizable: false
      },
      {
        id: 'bedsheet-5',
        name: 'Solid Color Bedsheet Set',
        price: 1300,
        image: '/5.jpg',
        images: ['/5.jpg', '/6.jpg'],
        size: 'Queen',
        color: 'Beige',
        material: '100% Cotton',
        threadCount: '200',
        sizes: ['Single', 'Double', 'Queen', 'King'],
        colors: ['Beige', 'Grey', 'Navy'],
        care: 'Machine washable',
        description: 'Simple and elegant solid color bedsheet set.',
        category: 'bedsheets',
        customizable: false
      },
      {
        id: 'bedsheet-6',
        name: 'Luxury Satin Bedsheet',
        price: 2500,
        image: '/6.jpg',
        images: ['/6.jpg', '/7.jpg'],
        size: 'King',
        color: 'Ivory',
        material: 'Satin Cotton',
        threadCount: '400',
        sizes: ['Queen', 'King'],
        colors: ['Ivory', 'Champagne', 'Pearl'],
        care: 'Delicate wash',
        description: 'Ultra-luxurious satin finish bedsheet for premium comfort.',
        category: 'bedsheets',
        customizable: false
      }
    ],
    customizable: [
      {
        id: 'bedsheet-custom-1',
        name: 'Custom Cotton Bedsheet',
        basePrice: 2000,
        price: 2000,
        image: '/1.jpg',
        images: ['/1.jpg', '/2.jpg', '/3.jpg'],
        sizes: ['Single', 'Double', 'Queen', 'King'],
        colors: ['White', 'Cream', 'Beige', 'Blue', 'Pink', 'Green'],
        patterns: ['Solid', 'Striped', 'Floral', 'Geometric', 'Paisley'],
        materials: ['100% Cotton', 'Premium Cotton', 'Cotton-Poly Blend'],
        threadCounts: ['200', '300', '400'],
        description: 'Design your perfect bedsheet with custom size, color, pattern, and material.',
        category: 'bedsheets',
        customizable: true
      },
      {
        id: 'bedsheet-custom-2',
        name: 'Premium Custom Bedsheet',
        basePrice: 3000,
        price: 3000,
        image: '/2.jpg',
        images: ['/2.jpg', '/4.jpg', '/5.jpg'],
        sizes: ['Double', 'Queen', 'King'],
        colors: ['Cream', 'Beige', 'Ivory', 'Navy', 'Grey'],
        patterns: ['Solid', 'Striped', 'Floral', 'Traditional'],
        materials: ['Premium Cotton', 'Cotton-Poly Blend', 'Luxury Cotton'],
        threadCounts: ['300', '400', '500'],
        description: 'Premium quality custom bedsheet with higher thread count options.',
        category: 'bedsheets',
        customizable: true
      },
      {
        id: 'bedsheet-custom-3',
        name: 'Luxury Custom Bedsheet',
        basePrice: 4500,
        price: 4500,
        image: '/6.jpg',
        images: ['/6.jpg', '/7.jpg', '/1.jpg'],
        sizes: ['Queen', 'King'],
        colors: ['Ivory', 'Champagne', 'Pearl', 'Navy', 'Burgundy'],
        patterns: ['Solid', 'Floral', 'Traditional', 'Designer'],
        materials: ['Luxury Cotton', 'Satin Cotton', 'Premium Blend'],
        threadCounts: ['400', '500', '600'],
        description: 'Ultra-luxury custom bedsheet with designer patterns and premium materials.',
        category: 'bedsheets',
        customizable: true
      }
    ]
  },
  bags: {
    normal: [
      {
        id: 'bag-1',
        name: 'Classic Cotton Tote Bag',
        price: 499,
        image: '/hero.png',
        images: ['/hero.png', '/1.jpg'],
        size: 'Medium',
        color: 'Beige',
        material: '100% Cotton',
        capacity: 'Medium',
        sizes: ['Small', 'Medium', 'Large'],
        colors: ['Beige', 'Brown', 'Navy'],
        care: 'Machine washable',
        description: 'Versatile cotton tote bag perfect for daily use.',
        category: 'bags',
        customizable: false
      },
      {
        id: 'bag-2',
        name: 'Canvas Shoulder Bag',
        price: 699,
        image: '/hero.png',
        images: ['/hero.png', '/2.jpg'],
        size: 'Large',
        color: 'Brown',
        material: 'Canvas',
        capacity: 'Large',
        sizes: ['Medium', 'Large'],
        colors: ['Brown', 'Black', 'Navy'],
        care: 'Spot clean',
        description: 'Durable canvas bag with comfortable shoulder strap.',
        category: 'bags',
        customizable: false
      },
      {
        id: 'bag-3',
        name: 'Eco-Friendly Jute Bag',
        price: 399,
        image: '/hero.png',
        images: ['/hero.png', '/3.jpg'],
        size: 'Medium',
        color: 'Natural',
        material: 'Jute',
        capacity: 'Medium',
        sizes: ['Small', 'Medium', 'Large'],
        colors: ['Natural', 'Beige', 'Brown'],
        care: 'Hand wash',
        description: 'Sustainable jute bag for eco-conscious shoppers.',
        category: 'bags',
        customizable: false
      },
      {
        id: 'bag-4',
        name: 'Premium Leather-Look Bag',
        price: 899,
        image: '/hero.png',
        images: ['/hero.png', '/4.jpg'],
        size: 'Large',
        color: 'Black',
        material: 'Synthetic Leather',
        capacity: 'Large',
        sizes: ['Medium', 'Large'],
        colors: ['Black', 'Brown', 'Navy'],
        care: 'Wipe clean',
        description: 'Stylish bag with premium leather-like finish.',
        category: 'bags',
        customizable: false
      },
      {
        id: 'bag-5',
        name: 'Printed Cotton Bag',
        price: 549,
        image: '/hero.png',
        images: ['/hero.png', '/5.jpg'],
        size: 'Medium',
        color: 'Multi',
        material: '100% Cotton',
        capacity: 'Medium',
        sizes: ['Small', 'Medium', 'Large'],
        colors: ['Multi', 'Blue-White', 'Red-White'],
        care: 'Machine washable',
        description: 'Colorful printed bag adding fun to your style.',
        category: 'bags',
        customizable: false
      },
      {
        id: 'bag-6',
        name: 'Minimalist Canvas Bag',
        price: 599,
        image: '/hero.png',
        images: ['/hero.png', '/6.jpg'],
        size: 'Medium',
        color: 'Grey',
        material: 'Canvas',
        capacity: 'Medium',
        sizes: ['Small', 'Medium', 'Large'],
        colors: ['Grey', 'Black', 'Navy'],
        care: 'Spot clean',
        description: 'Clean and minimal design for modern aesthetics.',
        category: 'bags',
        customizable: false
      }
    ],
    customizable: [
      {
        id: 'bag-custom-1',
        name: 'Custom Cotton Bag',
        basePrice: 799,
        price: 799,
        image: '/hero.png',
        images: ['/hero.png', '/1.jpg', '/2.jpg'],
        sizes: ['Small', 'Medium', 'Large'],
        colors: ['Beige', 'Brown', 'Navy', 'Black', 'Red', 'Blue'],
        materials: ['100% Cotton', 'Canvas', 'Premium Cotton'],
        patterns: ['Solid', 'Striped', 'Polka Dot', 'Floral'],
        description: 'Create your perfect custom bag with personalized size, color, material, and pattern.',
        category: 'bags',
        customizable: true
      },
      {
        id: 'bag-custom-2',
        name: 'Premium Custom Bag',
        basePrice: 1299,
        price: 1299,
        image: '/hero.png',
        images: ['/hero.png', '/3.jpg', '/4.jpg'],
        sizes: ['Medium', 'Large'],
        colors: ['Brown', 'Navy', 'Black', 'Burgundy', 'Charcoal'],
        materials: ['Premium Cotton', 'Canvas', 'Synthetic Leather'],
        patterns: ['Solid', 'Striped', 'Geometric', 'Traditional'],
        description: 'Premium quality custom bag with enhanced durability and style options.',
        category: 'bags',
        customizable: true
      },
      {
        id: 'bag-custom-3',
        name: 'Designer Custom Bag',
        basePrice: 1999,
        price: 1999,
        image: '/hero.png',
        images: ['/hero.png', '/5.jpg', '/6.jpg'],
        sizes: ['Large'],
        colors: ['Black', 'Navy', 'Burgundy', 'Charcoal', 'Brown', 'Beige'],
        materials: ['Luxury Cotton', 'Premium Canvas', 'Designer Material'],
        patterns: ['Solid', 'Geometric', 'Abstract', 'Designer'],
        description: 'Top-tier designer custom bag with exclusive patterns and premium materials.',
        category: 'bags',
        customizable: true
      }
    ]
  }
};

// Helper function to get all products
export const getAllProducts = () => {
  const allProducts = [];
  Object.keys(products).forEach(category => {
    allProducts.push(...products[category].normal);
    allProducts.push(...products[category].customizable);
  });
  return allProducts;
};

// Helper function to get products by category
export const getProductsByCategory = (category) => {
  if (!products[category]) return [];
  return [...products[category].normal, ...products[category].customizable];
};

// Helper function to get product by ID
export const getProductById = (id) => {
  const allProducts = getAllProducts();
  return allProducts.find(product => product.id === id);
};

// Helper function to get featured products (first 6 from each category)
export const getFeaturedProducts = () => {
  const featured = [];
  Object.keys(products).forEach(category => {
    featured.push(...products[category].normal.slice(0, 2));
  });
  return featured;
};
