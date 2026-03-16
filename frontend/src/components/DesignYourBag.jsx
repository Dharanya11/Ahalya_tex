import { useState, useRef, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import Footer from './Footer';

export default function DesignYourBag() {
  const { addToCart } = useCart();
  
  const [customization, setCustomization] = useState({
    bagColor: '#8B4513',
    handleColor: '#654321',
    zipColor: '#FFD700',
    size: 'Medium',
    customText: 'Charu',
    fontStyle: 'cursive',
    textColor: '#F5F5DC',
    imageUpload: null,
    imagePreview: null,
    imagePlacement: 'center',
    fabricType: 'cotton',
    fabricPattern: 'solid',
    handleType: 'standard'
  });

  const [price, setPrice] = useState(799);
  const [savedDesigns, setSavedDesigns] = useState([]);
  const fileInputRef = useRef(null);

  const basePrice = 799;
  const namePrintPrice = 99;
  const imagePrintPrice = 149;
  const premiumFabricPrice = 199;

  const fontOptions = [
    { value: 'cursive', label: 'Elegant Cursive' },
    { value: 'bold', label: 'Bold Modern' },
    { value: 'serif', label: 'Classic Serif' },
    { value: 'sans-serif', label: 'Clean Sans-Serif' },
    { value: 'script', label: 'Script Style' }
  ];

  const sizeOptions = [
    { value: 'Small', label: 'Small', dimensions: '12" × 14"', price: 0 },
    { value: 'Medium', label: 'Medium', dimensions: '14" × 16"', price: 0 },
    { value: 'Large', label: 'Large', dimensions: '16" × 18"', price: 200 }
  ];

  const fabricPatterns = [
    { value: 'solid', label: 'Solid', description: 'Clean solid color' },
    { value: 'striped', label: 'Striped', description: 'Classic stripes' },
    { value: 'geometric', label: 'Geometric', description: 'Modern geometric' },
    { value: 'floral', label: 'Floral', description: 'Elegant floral print' },
    { value: 'paisley', label: 'Paisley', description: 'Traditional paisley' },
    { value: 'woven', label: 'Woven', description: 'Textured weave pattern' }
  ];

  const handleTypes = [
    { value: 'standard', label: 'Standard Handles', description: 'Classic top handles', price: 0 },
    { value: 'crossbody', label: 'Crossbody Strap', description: 'Adjustable long strap', price: 150 },
    { value: 'double', label: 'Double Handles', description: 'Two parallel handles', price: 100 },
    { value: 'leather', label: 'Leather Handles', description: 'Premium leather', price: 300 }
  ];

  const fabricSwatches = [
    { color: '#8B4513', name: 'Saddle Brown' },
    { color: '#654321', name: 'Dark Brown' },
    { color: '#D2691E', name: 'Chocolate' },
    { color: '#CD853F', name: 'Peru' },
    { color: '#A0522D', name: 'Sienna' },
    { color: '#6B4423', name: 'Coffee' },
    { color: '#2F4F4F', name: 'Dark Slate' },
    { color: '#4682B4', name: 'Steel Blue' },
    { color: '#8B0000', name: 'Dark Red' },
    { color: '#556B2F', name: 'Dark Olive' },
    { color: '#D2B48C', name: 'Tan' },
    { color: '#F5DEB3', name: 'Wheat' }
  ];
  const placementOptions = [
    { value: 'center', label: 'Center' },
    { value: 'top', label: 'Top' },
    { value: 'bottom', label: 'Bottom' },
    { value: 'left', label: 'Left Side' },
    { value: 'right', label: 'Right Side' }
  ];

  // Calculate price based on customizations
  useEffect(() => {
    let total = basePrice;
    
    const selectedSize = sizeOptions.find(s => s.value === customization.size);
    if (selectedSize) {
      total += selectedSize.price;
    }
    
    if (customization.customText && customization.customText.trim() !== '') {
      total += namePrintPrice;
    }
    
    if (customization.imageUpload) {
      total += imagePrintPrice;
    }
    
    if (customization.fabricType === 'premium') {
      total += premiumFabricPrice;
    }

    const selectedHandle = handleTypes.find(h => h.value === customization.handleType);
    if (selectedHandle) {
      total += selectedHandle.price;
    }
    
    setPrice(total);
  }, [customization]);

  const handleChange = (field, value) => {
    setCustomization(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomization(prev => ({
          ...prev,
          imageUpload: file,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setCustomization(prev => ({
      ...prev,
      imageUpload: null,
      imagePreview: null
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const saveDesign = () => {
    const design = {
      id: Date.now(),
      ...customization,
      price: price,
      savedAt: new Date().toISOString()
    };
    
    const savedDesigns = localStorage.getItem('savedBagDesigns');
    const designs = savedDesigns && savedDesigns !== '' ? JSON.parse(savedDesigns) : [];
    designs.push(design);
    localStorage.setItem('savedBagDesigns', JSON.stringify(designs));
    setSavedDesigns(designs);
    
    alert('Design saved successfully!');
  };

  const loadSavedDesign = (design) => {
    setCustomization({
      bagColor: design.bagColor,
      handleColor: design.handleColor,
      zipColor: design.zipColor,
      size: design.size,
      customText: design.customText,
      fontStyle: design.fontStyle,
      textColor: design.textColor,
      imageUpload: null, // Can't restore file, but can restore preview if stored
      imagePreview: design.imagePreview || null,
      imagePlacement: design.imagePlacement,
      fabricType: design.fabricType
    });
  };

  useEffect(() => {
    try {
      const savedDesigns = localStorage.getItem('savedBagDesigns');
      const designs = savedDesigns && savedDesigns !== '' ? JSON.parse(savedDesigns) : [];
      setSavedDesigns(designs);
    } catch (error) {
      console.error('Error loading saved designs:', error);
      localStorage.removeItem('savedBagDesigns');
      setSavedDesigns([]);
    }
  }, []);

  // Get font family from font style
  const getFontFamily = (fontStyle) => {
    const fontMap = {
      'cursive': "'Dancing Script', cursive",
      'bold': "'Poppins', sans-serif",
      'serif': "'Playfair Display', serif",
      'sans-serif': "'Poppins', sans-serif",
      'script': "'Great Vibes', cursive"
    };
    return fontMap[fontStyle] || "'Poppins', sans-serif";
  };

  // Get text position styles
  const getTextPosition = (placement) => {
    const positions = {
      'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
      'top': { top: '20%', left: '50%', transform: 'translateX(-50%)' },
      'bottom': { bottom: '20%', left: '50%', transform: 'translateX(-50%)' },
      'left': { top: '50%', left: '15%', transform: 'translateY(-50%)' },
      'right': { top: '50%', right: '15%', transform: 'translateY(-50%)' }
    };
    return positions[placement] || positions.center;
  };

  return (
    <div className="design-bag-container">
      <div className="design-bag-hero">
        <h1 className="design-bag-title">Design Your Bag</h1>
        <p className="design-bag-subtitle">Create a custom bag that's uniquely yours</p>
      </div>

      <div className="design-bag-content">
        {/* Customization Panel */}
        <div className="customization-panel">
          <h2 className="panel-title">Customize Your Bag</h2>

          {/* Colors Section */}
          <div className="customization-section">
            <h3 className="section-title">Bag Color</h3>
            
            <div className="fabric-swatches">
              <label className="swatches-label">Quick Select</label>
              <div className="swatches-grid">
                {fabricSwatches.map((swatch, idx) => (
                  <button
                    key={idx}
                    className={`fabric-swatch ${customization.bagColor === swatch.color ? 'active' : ''}`}
                    onClick={() => handleChange('bagColor', swatch.color)}
                    style={{ backgroundColor: swatch.color }}
                    title={swatch.name}
                  >
                    {customization.bagColor === swatch.color && (
                      <span className="swatch-check">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Custom Color</label>
              <div className="color-input-group">
                <input
                  type="color"
                  value={customization.bagColor}
                  onChange={(e) => handleChange('bagColor', e.target.value)}
                  className="color-picker"
                />
                <input
                  type="text"
                  value={customization.bagColor}
                  onChange={(e) => handleChange('bagColor', e.target.value)}
                  className="color-text"
                  placeholder="#8B4513"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Handle Color</label>
              <div className="color-input-group">
                <input
                  type="color"
                  value={customization.handleColor}
                  onChange={(e) => handleChange('handleColor', e.target.value)}
                  className="color-picker"
                />
                <input
                  type="text"
                  value={customization.handleColor}
                  onChange={(e) => handleChange('handleColor', e.target.value)}
                  className="color-text"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Zipper Color</label>
              <div className="color-input-group">
                <input
                  type="color"
                  value={customization.zipColor}
                  onChange={(e) => handleChange('zipColor', e.target.value)}
                  className="color-picker"
                />
                <input
                  type="text"
                  value={customization.zipColor}
                  onChange={(e) => handleChange('zipColor', e.target.value)}
                  className="color-text"
                />
              </div>
            </div>
          </div>

          {/* Size Section */}
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
                  {size.price > 0 && (
                    <div className="size-price">+₹{size.price}</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Fabric Pattern Section */}
          <div className="customization-section">
            <h3 className="section-title">Fabric Pattern</h3>
            <div className="pattern-swatches">
              {fabricPatterns.map(pattern => (
                <button
                  key={pattern.value}
                  className={`pattern-swatch ${customization.fabricPattern === pattern.value ? 'active' : ''}`}
                  onClick={() => handleChange('fabricPattern', pattern.value)}
                >
                  <div 
                    className="pattern-preview-mini"
                    data-pattern={pattern.value}
                    style={{ backgroundColor: customization.bagColor }}
                  >
                    <div className="pattern-mini-inner"></div>
                  </div>
                  <div className="pattern-info-mini">
                    <span className="pattern-label-mini">{pattern.label}</span>
                    <small className="pattern-desc-mini">{pattern.description}</small>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Handle Type Section */}
          <div className="customization-section">
            <h3 className="section-title">Handle Type</h3>
            <div className="handle-options">
              {handleTypes.map(handle => (
                <button
                  key={handle.value}
                  className={`handle-option ${customization.handleType === handle.value ? 'active' : ''}`}
                  onClick={() => handleChange('handleType', handle.value)}
                >
                  <div className="handle-preview" data-handle={handle.value}>
                    <div className="handle-preview-inner"></div>
                  </div>
                  <div className="handle-info">
                    <span className="handle-label">{handle.label}</span>
                    <small className="handle-desc">{handle.description}</small>
                    {handle.price > 0 && (
                      <span className="handle-price">+₹{handle.price}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Fabric Type */}
          <div className="customization-section">
            <h3 className="section-title">Fabric Quality</h3>
            <div className="fabric-quality-options">
              <label className={`quality-option ${customization.fabricType === 'cotton' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="fabricType"
                  value="cotton"
                  checked={customization.fabricType === 'cotton'}
                  onChange={(e) => handleChange('fabricType', e.target.value)}
                />
                <span>Standard Cotton</span>
              </label>
              <label className={`quality-option ${customization.fabricType === 'premium' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="fabricType"
                  value="premium"
                  checked={customization.fabricType === 'premium'}
                  onChange={(e) => handleChange('fabricType', e.target.value)}
                />
                <span>Premium Cotton (+₹199)</span>
              </label>
            </div>
          </div>

          {/* Personalization Section */}
          <div className="customization-section">
            <h3 className="section-title">Personalization</h3>
            
            <div className="form-group">
              <label>Custom Text / Name</label>
              <input
                type="text"
                value={customization.customText}
                onChange={(e) => handleChange('customText', e.target.value)}
                placeholder="Enter name or text"
                className="form-input"
                maxLength={20}
              />
              <small className="form-hint">+₹99 for text printing</small>
            </div>

            <div className="form-group">
              <label>Font Style</label>
              <select
                value={customization.fontStyle}
                onChange={(e) => handleChange('fontStyle', e.target.value)}
                className="form-select"
              >
                {fontOptions.map(font => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Text Color</label>
              <div className="color-input-group">
                <input
                  type="color"
                  value={customization.textColor}
                  onChange={(e) => handleChange('textColor', e.target.value)}
                  className="color-picker"
                />
                <input
                  type="text"
                  value={customization.textColor}
                  onChange={(e) => handleChange('textColor', e.target.value)}
                  className="color-text"
                />
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="customization-section">
            <h3 className="section-title">Image / Logo</h3>
            
            {customization.imagePreview ? (
              <div className="image-preview-container">
                <img src={customization.imagePreview} alt="Upload preview" className="uploaded-image-preview" />
                <button className="remove-image-btn" onClick={removeImage}>Remove</button>
              </div>
            ) : (
              <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                <span>📷</span>
                <p>Click to upload image or logo</p>
                <small>+₹149 for image printing</small>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />

            {customization.imageUpload && (
              <div className="form-group">
                <label>Image Placement</label>
                <select
                  value={customization.imagePlacement}
                  onChange={(e) => handleChange('imagePlacement', e.target.value)}
                  className="form-select"
                >
                  {placementOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="save-design-btn" onClick={saveDesign}>
              💾 Save Design
            </button>
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="preview-panel">
          <h2 className="panel-title">Live Preview</h2>
          
          <div className="bag-preview-container">
            <div className="bag-mockup-wrapper">
              <div 
                key={`bag-${customization.bagColor}-${customization.size}-${customization.fabricPattern}-${customization.handleType}`}
                className="bag-mockup"
                style={{
                  '--bag-color': customization.bagColor,
                  '--handle-color': customization.handleColor,
                  '--zip-color': customization.zipColor,
                  width: customization.size === 'Small' ? '280px' : customization.size === 'Medium' ? '340px' : '400px',
                  height: customization.size === 'Small' ? '320px' : customization.size === 'Medium' ? '380px' : '440px'
                }}
                data-pattern={customization.fabricPattern}
                data-handle={customization.handleType}
                data-fabric={customization.fabricType}
              >
                {/* Bag Body */}
                <div className="bag-body">
                  <div className="bag-front"></div>
                  <div className="bag-back"></div>
                  <div className="bag-side-left"></div>
                  <div className="bag-side-right"></div>
                  <div className="bag-bottom"></div>
                  
                  {/* Fabric Pattern Overlay */}
                  <div className="bag-pattern-overlay"></div>
                  
                  {/* Texture */}
                  <div className="bag-texture"></div>
                </div>

                {/* Handles based on type */}
                {customization.handleType === 'standard' && (
                  <>
                    <div 
                      className="bag-handle handle-left"
                      style={{ backgroundColor: customization.handleColor }}
                    ></div>
                    <div 
                      className="bag-handle handle-right"
                      style={{ backgroundColor: customization.handleColor }}
                    ></div>
                  </>
                )}
                
                {customization.handleType === 'crossbody' && (
                  <div 
                    className="bag-handle handle-crossbody"
                    style={{ backgroundColor: customization.handleColor }}
                  ></div>
                )}
                
                {customization.handleType === 'double' && (
                  <>
                    <div 
                      className="bag-handle handle-double-1"
                      style={{ backgroundColor: customization.handleColor }}
                    ></div>
                    <div 
                      className="bag-handle handle-double-2"
                      style={{ backgroundColor: customization.handleColor }}
                    ></div>
                  </>
                )}
                
                {customization.handleType === 'leather' && (
                  <>
                    <div 
                      className="bag-handle handle-leather-left"
                      style={{ backgroundColor: customization.handleColor }}
                    ></div>
                    <div 
                      className="bag-handle handle-leather-right"
                      style={{ backgroundColor: customization.handleColor }}
                    ></div>
                  </>
                )}

                {/* Zipper */}
                <div 
                  className="bag-zipper"
                  style={{ backgroundColor: customization.zipColor }}
                ></div>

                {/* Custom Text / Embroidery */}
                {customization.customText && (
                  <div
                    className="bag-embroidery"
                    style={{
                      color: customization.textColor,
                      fontFamily: getFontFamily(customization.fontStyle),
                      fontWeight: customization.fontStyle === 'bold' ? 'bold' : 'normal',
                      ...getTextPosition(customization.imagePlacement)
                    }}
                  >
                    {customization.customText}
                  </div>
                )}

                {/* Uploaded Image */}
                {customization.imagePreview && (
                  <div
                    className="bag-image"
                    style={{
                      ...getTextPosition(customization.imagePlacement),
                      width: '80px',
                      height: '80px'
                    }}
                  >
                    <img 
                      src={customization.imagePreview} 
                      alt="Custom" 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                )}

                {/* Shadow */}
                <div className="bag-shadow"></div>
              </div>
            </div>
          </div>

          {/* Price Display */}
          <div className="price-display">
            <div className="price-breakdown">
              <div className="price-item">
                <span>Base Price</span>
                <span>₹{basePrice}</span>
              </div>
              {customization.customText && (
                <div className="price-item">
                  <span>Name Print</span>
                  <span>+₹{namePrintPrice}</span>
                </div>
              )}
              {customization.imageUpload && (
                <div className="price-item">
                  <span>Image Print</span>
                  <span>+₹{imagePrintPrice}</span>
                </div>
              )}
              {customization.fabricType === 'premium' && (
                <div className="price-item">
                  <span>Premium Fabric</span>
                  <span>+₹{premiumFabricPrice}</span>
                </div>
              )}
              {(() => {
                const selectedHandle = handleTypes.find(h => h.value === customization.handleType);
                const selectedSize = sizeOptions.find(s => s.value === customization.size);
                return (
                  <>
                    {selectedHandle && selectedHandle.price > 0 && (
                      <div className="price-item">
                        <span>Handle Upgrade</span>
                        <span>+₹{selectedHandle.price}</span>
                      </div>
                    )}
                    {selectedSize && selectedSize.price > 0 && (
                      <div className="price-item">
                        <span>Size Upgrade</span>
                        <span>+₹{selectedSize.price}</span>
                      </div>
                    )}
                  </>
                );
              })()}
              <div className="price-total">
                <span>Total</span>
                <span>₹{price.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <button 
              className="add-to-cart-btn-large"
              onClick={() => {
                const product = {
                  id: `bag-custom-${Date.now()}`,
                  name: `Custom ${customization.size} Bag`,
                  price: price,
                  image: '/2.jpg',
                  category: 'bags',
                  customization: { ...customization }
                };
                addToCart(product, customization.size, customization.bagColor, 1);
                alert('Custom bag added to cart!');
              }}
            >
              Add to Cart - ₹{price.toLocaleString('en-IN')}
            </button>
          </div>
        </div>
      </div>

      {/* Saved Designs Section */}
      {savedDesigns.length > 0 && (
        <div className="saved-designs-section">
          <h2>Your Saved Designs</h2>
          <div className="saved-designs-grid">
            {savedDesigns.map(design => (
              <div key={design.id} className="saved-design-card">
                <div 
                  className="saved-design-preview"
                  style={{ backgroundColor: design.bagColor }}
                >
                  {design.customText && (
                    <span style={{ color: design.textColor }}>{design.customText}</span>
                  )}
                </div>
                <div className="saved-design-info">
                  <p>₹{design.price}</p>
                  <button onClick={() => loadSavedDesign(design)}>Load</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
