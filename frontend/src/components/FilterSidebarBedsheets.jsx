import { useState } from 'react';

export default function FilterSidebarBedsheets({ onFilterChange }) {
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [priceRange, setPriceRange] = useState([1200, 6000]);

  const sizes = ['Single', 'Double', 'Queen', 'King'];
  const colors = [
    { name: 'Beige', hex: '#E6D3B1' },
    { name: 'Brown', hex: '#8B5A2B' },
    { name: 'Maroon', hex: '#8C2F2F' },
    { name: 'Indigo', hex: '#3A5A78' },
    { name: 'Olive', hex: '#4E6B50' }
  ];

  const handleSizeChange = (size) => {
    const newSizes = selectedSizes.includes(size)
      ? selectedSizes.filter(s => s !== size)
      : [...selectedSizes, size];
    setSelectedSizes(newSizes);
    onFilterChange({ sizes: newSizes, colors: selectedColors, priceRange });
  };

  const handleColorChange = (color) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter(c => c !== color)
      : [...selectedColors, color];
    setSelectedColors(newColors);
    onFilterChange({ sizes: selectedSizes, colors: newColors, priceRange });
  };

  const handlePriceChange = (e) => {
    const newMax = parseInt(e.target.value);
    setPriceRange([priceRange[0], newMax]);
    onFilterChange({ sizes: selectedSizes, colors: selectedColors, priceRange: [priceRange[0], newMax] });
  };

  return (
    <aside className="filter-sidebar">
      <h3 className="filter-heading">Filters</h3>

      <div className="filter-group">
        <h4 className="filter-label">Bed Size</h4>
        {sizes.map(size => (
          <label key={size} className="checkbox-label">
            <input
              type="checkbox"
              checked={selectedSizes.includes(size)}
              onChange={() => handleSizeChange(size)}
            />
            <span>{size}</span>
          </label>
        ))}
      </div>

      <div className="filter-group">
        <h4 className="filter-label">Color</h4>
        <div className="color-options">
          {colors.map(color => (
            <div
              key={color.name}
              className={`color-dot ${selectedColors.includes(color.name) ? 'selected' : ''}`}
              style={{ backgroundColor: color.hex }}
              onClick={() => handleColorChange(color.name)}
              title={color.name}
            />
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h4 className="filter-label">Price</h4>
        <div className="price-range">
          <span className="price-text">₹{priceRange[0]} — ₹{priceRange[1]}</span>
          <input
            type="range"
            min="1200"
            max="6000"
            step="300"
            value={priceRange[1]}
            onChange={handlePriceChange}
            className="price-slider"
          />
        </div>
      </div>
    </aside>
  );
}

