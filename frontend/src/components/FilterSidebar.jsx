export default function FilterSidebar({
  priceRange,
  onPriceRangeChange,
  selectedSizes,
  onSizesChange,
  selectedMaterials,
  onMaterialsChange,
  selectedColors,
  onColorsChange,
  availableSizes = [],
  availableMaterials = [],
  availableColors = [],
  category
}) {
  const handleSizeToggle = (size) => {
    if (selectedSizes.includes(size)) {
      onSizesChange(selectedSizes.filter(s => s !== size));
    } else {
      onSizesChange([...selectedSizes, size]);
    }
  };

  const handleMaterialToggle = (material) => {
    if (selectedMaterials.includes(material)) {
      onMaterialsChange(selectedMaterials.filter(m => m !== material));
    } else {
      onMaterialsChange([...selectedMaterials, material]);
    }
  };

  const handleColorToggle = (color) => {
    if (selectedColors.includes(color)) {
      onColorsChange(selectedColors.filter(c => c !== color));
    } else {
      onColorsChange([...selectedColors, color]);
    }
  };

  const handlePriceChange = (e) => {
    const newMax = parseInt(e.target.value);
    onPriceRangeChange([priceRange[0], newMax]);
  };

  const clearAllFilters = () => {
    onSizesChange([]);
    onMaterialsChange([]);
    onColorsChange([]);
    onPriceRangeChange([0, 10000]);
  };

  // Color mapping for visual display
  const colorMap = {
    'Red': '#8C2F2F',
    'Blue': '#3A5A78',
    'Green': '#4E6B50',
    'Brown': '#8B5A2B',
    'Beige': '#E6D3B1',
    'Cream': '#F5E6D3',
    'White': '#FFFFFF',
    'Black': '#000000',
    'Navy': '#1A1A2E',
    'Grey': '#808080',
    'Maroon': '#800000',
    'Olive': '#556B2F',
    'Mint': '#98FB98',
    'Indigo': '#4B0082',
    'Tan': '#D2B48C',
    'Ivory': '#FFFFF0',
    'Champagne': '#F7E7CE',
    'Pearl': '#F8F6F0',
    'Burgundy': '#800020',
    'Charcoal': '#36454F',
    'Natural': '#E6D3B1',
    'Multi': '#8B5A2B',
    'Blue-White': '#3A5A78',
    'Red-White': '#8C2F2F',
    'Dark Brown': '#654321',
    'Pink': '#FFC0CB'
  };

  return (
    <aside className="filter-sidebar">
      <div className="filter-header">
        <h3 className="filter-heading">Filters</h3>
        <button className="clear-filters-btn" onClick={clearAllFilters}>
          Clear All
        </button>
      </div>

      {/* Price Filter */}
      <div className="filter-group">
        <h4 className="filter-label">Price Range</h4>
        <div className="price-range">
          <span className="price-text">₹{priceRange[0]} — ₹{priceRange[1]}</span>
          <input
            type="range"
            min="0"
            max="10000"
            step="100"
            value={priceRange[1]}
            onChange={handlePriceChange}
            className="price-slider"
          />
        </div>
      </div>

      {/* Size Filter */}
      {availableSizes.length > 0 && (
        <div className="filter-group">
          <h4 className="filter-label">Size</h4>
          {availableSizes.map(size => (
            <label key={size} className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedSizes.includes(size)}
                onChange={() => handleSizeToggle(size)}
              />
              <span>{size}</span>
            </label>
          ))}
        </div>
      )}

      {/* Material/Pattern Filter */}
      {availableMaterials.length > 0 && (
        <div className="filter-group">
          <h4 className="filter-label">
            {category === 'carpets' ? 'Material / Pattern' : category === 'bedsheets' ? 'Material / Thread Count' : 'Material'}
          </h4>
          {availableMaterials.map(material => (
            <label key={material} className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedMaterials.includes(material)}
                onChange={() => handleMaterialToggle(material)}
              />
              <span>{material}</span>
            </label>
          ))}
        </div>
      )}

      {/* Color Filter */}
      {availableColors.length > 0 && (
        <div className="filter-group">
          <h4 className="filter-label">Color</h4>
          <div className="color-options">
            {availableColors.map(color => (
              <div
                key={color}
                className={`color-dot ${selectedColors.includes(color) ? 'selected' : ''}`}
                style={{ 
                  backgroundColor: colorMap[color] || '#E6D3B1',
                  border: color === 'White' ? '1px solid #ccc' : 'none'
                }}
                onClick={() => handleColorToggle(color)}
                title={color}
              />
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
