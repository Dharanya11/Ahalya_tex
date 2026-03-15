import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import Footer from './Footer';

export default function DesignYourCarpet() {
  const { addToCart } = useCart();
  
  const [customization, setCustomization] = useState({
    size: 'Medium',
    colorPalette: 'warm',
    primaryColor: '#8B4513',
    secondaryColor: '#D2691E',
    borderDesign: 'traditional',
    patternStyle: 'paisley',
    materialType: 'cotton',
    borderColor: '#654321'
  });

  const [price, setPrice] = useState(2500);
  const [showRoomPreview, setShowRoomPreview] = useState(true);

  const basePrice = 2000;
  const sizeMultipliers = { Small: 1, Medium: 1.5, Large: 2.2 };
  const materialPrices = { cotton: 0, premium: 500, silk: 1000 };

  const sizeOptions = [
    { value: 'Small', label: 'Small (4x6 ft)', dimensions: '4ft × 6ft' },
    { value: 'Medium', label: 'Medium (6x9 ft)', dimensions: '6ft × 9ft' },
    { value: 'Large', label: 'Large (9x12 ft)', dimensions: '9ft × 12ft' }
  ];

  const colorPalettes = [
    { value: 'warm', label: 'Warm Earth', colors: ['#8B4513', '#D2691E', '#CD853F'] },
    { value: 'cool', label: 'Cool Tones', colors: ['#2F4F4F', '#4682B4', '#708090'] },
    { value: 'neutral', label: 'Neutral', colors: ['#D2B48C', '#F5DEB3', '#DEB887'] },
    { value: 'vibrant', label: 'Vibrant', colors: ['#8B0000', '#FF6347', '#FF8C00'] }
  ];

  const borderDesigns = [
    { value: 'traditional', label: 'Traditional', description: 'Classic geometric borders' },
    { value: 'modern', label: 'Modern', description: 'Clean minimalist lines' },
    { value: 'floral', label: 'Floral', description: 'Elegant flower patterns' },
    { value: 'paisley', label: 'Paisley', description: 'Intricate paisley motifs' },
    { value: 'none', label: 'No Border', description: 'Simple edge finish' }
  ];

  const patternStyles = [
    { value: 'paisley', label: 'Paisley', description: 'Classic paisley design' },
    { value: 'geometric', label: 'Geometric', description: 'Modern geometric patterns' },
    { value: 'floral', label: 'Floral', description: 'Traditional floral motifs' },
    { value: 'striped', label: 'Striped', description: 'Elegant stripes' },
    { value: 'solid', label: 'Solid', description: 'Solid color with texture' }
  ];

  const materialTypes = [
    { value: 'cotton', label: 'Cotton (Standard)', price: 0 },
    { value: 'premium', label: 'Premium Cotton', price: 500 },
    { value: 'silk', label: 'Silk Blend', price: 1000 }
  ];

  // Calculate price based on customizations
  useEffect(() => {
    const sizeMultiplier = sizeMultipliers[customization.size] || 1.5;
    const materialPrice = materialPrices[customization.materialType] || 0;
    const borderPrice = customization.borderDesign === 'none' ? 0 : 200;
    
    const calculatedPrice = Math.round((basePrice * sizeMultiplier) + materialPrice + borderPrice);
    setPrice(calculatedPrice);
  }, [customization]);

  const handleChange = (field, value) => {
    // Update primary color when palette changes
    if (field === 'colorPalette') {
      const palette = colorPalettes.find(p => p.value === value);
      if (palette) {
        setCustomization(prev => ({
          ...prev,
          colorPalette: value,
          primaryColor: palette.colors[0],
          secondaryColor: palette.colors[1]
        }));
      }
    } else {
      setCustomization(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAddToCart = () => {
    const product = {
      id: `carpet-custom-${Date.now()}`,
      name: `Custom ${customization.size} ${customization.patternStyle} Carpet`,
      price: price,
      image: '/carpet.jpg',
      category: 'carpets',
      customization: { ...customization }
    };

    addToCart(product, customization.size, customization.primaryColor, 1);
    alert('Custom carpet added to cart!');
  };

  // Get selected palette colors
  const selectedPalette = colorPalettes.find(p => p.value === customization.colorPalette);
  const paletteColors = selectedPalette?.colors || ['#8B4513', '#D2691E', '#CD853F'];

  return (
    <>
      <div className="design-carpet-container">
        <div className="design-carpet-hero">
          <h1 className="design-carpet-title">Design Your Carpet</h1>
          <p className="design-carpet-subtitle">Create a handcrafted carpet tailored to your space</p>
        </div>

        <div className="design-carpet-content">
          {/* Customization Panel */}
          <div className="carpet-customization-panel">
            <h2 className="panel-title">Customize Your Carpet</h2>

            {/* Size Selection */}
            <div className="customization-section">
              <h3 className="section-title">Size</h3>
              <div className="size-options-grid">
                {sizeOptions.map(size => (
                  <button
                    key={size.value}
                    className={`size-option-card ${customization.size === size.value ? 'active' : ''}`}
                    onClick={() => handleChange('size', size.value)}
                  >
                    <div className="size-label">{size.label}</div>
                    <div className="size-dimensions">{size.dimensions}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Palette */}
            <div className="customization-section">
              <h3 className="section-title">Color Palette</h3>
              <div className="palette-options">
                {colorPalettes.map(palette => (
                  <button
                    key={palette.value}
                    className={`palette-option ${customization.colorPalette === palette.value ? 'active' : ''}`}
                    onClick={() => handleChange('colorPalette', palette.value)}
                  >
                    <div className="palette-colors">
                      {palette.colors.map((color, idx) => (
                        <div
                          key={idx}
                          className="palette-color-swatch"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="palette-label">{palette.label}</span>
                  </button>
                ))}
              </div>
              
              {/* Color Picker */}
              <div className="color-picker-group">
                <div className="form-group">
                  <label>Primary Color</label>
                  <div className="color-input-group">
                    <input
                      type="color"
                      value={customization.primaryColor}
                      onChange={(e) => handleChange('primaryColor', e.target.value)}
                      className="color-picker"
                    />
                    <input
                      type="text"
                      value={customization.primaryColor}
                      onChange={(e) => handleChange('primaryColor', e.target.value)}
                      className="color-text"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Secondary Color</label>
                  <div className="color-input-group">
                    <input
                      type="color"
                      value={customization.secondaryColor}
                      onChange={(e) => handleChange('secondaryColor', e.target.value)}
                      className="color-picker"
                    />
                    <input
                      type="text"
                      value={customization.secondaryColor}
                      onChange={(e) => handleChange('secondaryColor', e.target.value)}
                      className="color-text"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pattern Style */}
            <div className="customization-section">
              <h3 className="section-title">Pattern Style</h3>
              <div className="pattern-options">
                {patternStyles.map(pattern => (
                  <button
                    key={pattern.value}
                    className={`pattern-option ${customization.patternStyle === pattern.value ? 'active' : ''}`}
                    onClick={() => handleChange('patternStyle', pattern.value)}
                  >
                    <div className="pattern-preview" data-pattern={pattern.value}>
                      <div className="pattern-preview-inner"></div>
                    </div>
                    <div className="pattern-info">
                      <span className="pattern-label">{pattern.label}</span>
                      <small className="pattern-desc">{pattern.description}</small>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Border Design */}
            <div className="customization-section">
              <h3 className="section-title">Border Design</h3>
              <div className="border-options">
                {borderDesigns.map(border => (
                  <button
                    key={border.value}
                    className={`border-option ${customization.borderDesign === border.value ? 'active' : ''}`}
                    onClick={() => handleChange('borderDesign', border.value)}
                  >
                    <div className="border-preview" data-border={border.value}>
                      <div className="border-preview-inner"></div>
                    </div>
                    <div className="border-info">
                      <span className="border-label">{border.label}</span>
                      <small className="border-desc">{border.description}</small>
                    </div>
                  </button>
                ))}
              </div>
              
              {customization.borderDesign !== 'none' && (
                <div className="form-group">
                  <label>Border Color</label>
                  <div className="color-input-group">
                    <input
                      type="color"
                      value={customization.borderColor}
                      onChange={(e) => handleChange('borderColor', e.target.value)}
                      className="color-picker"
                    />
                    <input
                      type="text"
                      value={customization.borderColor}
                      onChange={(e) => handleChange('borderColor', e.target.value)}
                      className="color-text"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Material Type */}
            <div className="customization-section">
              <h3 className="section-title">Material Type</h3>
              <div className="material-options">
                {materialTypes.map(material => (
                  <button
                    key={material.value}
                    className={`material-option ${customization.materialType === material.value ? 'active' : ''}`}
                    onClick={() => handleChange('materialType', material.value)}
                  >
                    <span className="material-label">{material.label}</span>
                    {material.price > 0 && (
                      <span className="material-price">+₹{material.price}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Room Preview Toggle */}
            <div className="customization-section">
              <div className="toggle-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={showRoomPreview}
                    onChange={(e) => setShowRoomPreview(e.target.checked)}
                    className="toggle-input"
                  />
                  <span className="toggle-text">Show in Living Room</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button className="add-to-cart-btn-large" onClick={handleAddToCart}>
                Add to Cart - ₹{price.toLocaleString('en-IN')}
              </button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="carpet-preview-panel">
            <h2 className="panel-title">Live Preview</h2>
            
            <div className={`carpet-preview-container ${showRoomPreview ? 'room-preview' : 'isolated-preview'}`}>
              {showRoomPreview ? (
                <div className="room-environment">
                  <div className="room-background">
                    <div className="room-wall"></div>
                    <div className="room-floor"></div>
                    <div className="room-furniture">
                      <div className="furniture sofa"></div>
                      <div className="furniture table"></div>
                      <div className="furniture plant"></div>
                    </div>
                  </div>
                  <div 
                    key={`carpet-room-${customization.primaryColor}-${customization.size}-${customization.patternStyle}-${customization.borderDesign}`}
                    className="carpet-preview room-carpet"
                    style={{
                      width: customization.size === 'Small' ? '35%' : customization.size === 'Medium' ? '50%' : '65%',
                      height: customization.size === 'Small' ? '30%' : customization.size === 'Medium' ? '40%' : '50%',
                      background: `linear-gradient(135deg, ${customization.primaryColor} 0%, ${customization.secondaryColor} 100%)`,
                      '--border-color': customization.borderColor
                    }}
                    data-pattern={customization.patternStyle}
                    data-border={customization.borderDesign}
                    data-material={customization.materialType}
                  >
                    <div className="carpet-texture"></div>
                    <div className="carpet-pattern"></div>
                    <div className="carpet-border"></div>
                  </div>
                </div>
              ) : (
                <div className="isolated-carpet-view">
                  <div 
                    key={`carpet-isolated-${customization.primaryColor}-${customization.size}-${customization.patternStyle}-${customization.borderDesign}`}
                    className="carpet-preview isolated-carpet"
                    style={{
                      width: customization.size === 'Small' ? '60%' : customization.size === 'Medium' ? '75%' : '90%',
                      background: `linear-gradient(135deg, ${customization.primaryColor} 0%, ${customization.secondaryColor} 100%)`,
                      '--border-color': customization.borderColor
                    }}
                    data-pattern={customization.patternStyle}
                    data-border={customization.borderDesign}
                    data-material={customization.materialType}
                  >
                    <div className="carpet-texture"></div>
                    <div className="carpet-pattern"></div>
                    <div className="carpet-border"></div>
                    <div className="carpet-shadow"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Price Display */}
            <div className="price-display">
              <div className="price-breakdown">
                <div className="price-item">
                  <span>Base Price ({customization.size})</span>
                  <span>₹{Math.round(basePrice * sizeMultipliers[customization.size]).toLocaleString('en-IN')}</span>
                </div>
                {materialPrices[customization.materialType] > 0 && (
                  <div className="price-item">
                    <span>Material Upgrade</span>
                    <span>+₹{materialPrices[customization.materialType]}</span>
                  </div>
                )}
                {customization.borderDesign !== 'none' && (
                  <div className="price-item">
                    <span>Border Design</span>
                    <span>+₹200</span>
                  </div>
                )}
                <div className="price-total">
                  <span>Total</span>
                  <span>₹{price.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
