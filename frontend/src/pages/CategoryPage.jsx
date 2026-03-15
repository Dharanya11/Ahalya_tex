import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import EmptyState from '../components/EmptyState';
import Footer from '../components/Footer';
import { getProductsByCategory } from '../data/products';

export default function CategoryPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [sortBy, setSortBy] = useState('default');

  // Handle legacy routes
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/shop') {
      navigate('/category/carpets', { replace: true });
    } else if (path === '/bedsheets') {
      navigate('/category/bedsheets', { replace: true });
    }
  }, [navigate]);

  const allProducts = getProductsByCategory(category || 'carpets');
  
  // Get unique filter values
  const availableSizes = useMemo(() => {
    const sizes = new Set();
    allProducts.forEach(product => {
      if (product.sizes) {
        product.sizes.forEach(size => sizes.add(size));
      }
    });
    return Array.from(sizes);
  }, [allProducts]);

  const availableMaterials = useMemo(() => {
    const materials = new Set();
    allProducts.forEach(product => {
      if (product.material) materials.add(product.material);
      if (product.materials) {
        product.materials.forEach(mat => materials.add(mat));
      }
    });
    return Array.from(materials);
  }, [allProducts]);

  const availableColors = useMemo(() => {
    const colors = new Set();
    allProducts.forEach(product => {
      if (product.color) colors.add(product.color);
      if (product.colors) {
        product.colors.forEach(col => colors.add(col));
      }
    });
    return Array.from(colors);
  }, [allProducts]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = allProducts.filter(product => {
      // Price filter
      const price = product.price || product.basePrice || 0;
      if (price < priceRange[0] || price > priceRange[1]) {
        return false;
      }

      // Size filter
      if (selectedSizes.length > 0) {
        const productSizes = product.sizes || [product.size];
        if (!selectedSizes.some(size => productSizes.includes(size))) {
          return false;
        }
      }

      // Material filter
      if (selectedMaterials.length > 0) {
        const productMaterials = product.materials || [product.material];
        if (!selectedMaterials.some(mat => productMaterials.includes(mat))) {
          return false;
        }
      }

      // Color filter
      if (selectedColors.length > 0) {
        const productColors = product.colors || [product.color];
        if (!selectedColors.some(col => productColors.includes(col))) {
          return false;
        }
      }

      return true;
    });

    // Sort products
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => (a.price || a.basePrice || 0) - (b.price || b.basePrice || 0));
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => (b.price || b.basePrice || 0) - (a.price || a.basePrice || 0));
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [allProducts, priceRange, selectedSizes, selectedMaterials, selectedColors, sortBy]);

  const categoryTitles = {
    carpets: 'Cotton Carpets',
    bedsheets: 'Bedsheets',
    bags: 'Bags'
  };

  const title = categoryTitles[category] || 'Products';

  return (
    <>
      <div className="shop-page">
        <div className="shop-hero">
          <div className="shop-hero-overlay"></div>
          <h1 className="shop-title">{title}</h1>
        </div>

        <div className="shop-container">
          <FilterSidebar
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            selectedSizes={selectedSizes}
            onSizesChange={setSelectedSizes}
            selectedMaterials={selectedMaterials}
            onMaterialsChange={setSelectedMaterials}
            selectedColors={selectedColors}
            onColorsChange={setSelectedColors}
            availableSizes={availableSizes}
            availableMaterials={availableMaterials}
            availableColors={availableColors}
            category={category}
          />

          <div className="products-section">
            <div className="products-header">
              <div className="sort-options">
                <label>Sort by:</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                  <option value="default">Default</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <>
                <p className="products-count">{filteredProducts.length} product(s) found</p>
                <div className="products-grid">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} category={category} />
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                message="No products found matching your criteria"
                icon="🔍"
                actionLabel="Clear Filters"
                onAction={() => {
                  setPriceRange([0, 10000]);
                  setSelectedSizes([]);
                  setSelectedMaterials([]);
                  setSelectedColors([]);
                }}
              />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
