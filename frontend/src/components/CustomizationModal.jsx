import { useState, useEffect } from 'react';
import { calculateCustomizedUnitPrice } from '../utils/pricing';

export default function CustomizationModal({ product, customization, onCustomizationChange, onAddToCart, onClose }) {
  const [price, setPrice] = useState(product.basePrice || product.price || 0);

  useEffect(() => {
    setPrice(calculateCustomizedUnitPrice(product, customization));
  }, [customization, product]);

  const handleChange = (field, value) => {
    onCustomizationChange({
      ...customization,
      [field]: value
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('imageUpload', file);
        handleChange('imagePreview', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    handleChange('imageUpload', null);
    handleChange('imagePreview', null);
  };

  const handleSubmit = () => {
    onAddToCart(customization);
  };

  return (
    <div className="customization-modal-overlay" onClick={onClose}>
      <div className="customization-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>×</button>
        
        <h2 className="modal-title">Customize {product.name}</h2>

        <div className="customization-form">
          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="form-group">
              <label>Size</label>
              <div className="size-options-inline">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    type="button"
                    className={`size-option-btn ${customization.size === size ? 'active' : ''}`}
                    onClick={() => handleChange('size', size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="form-group">
              <label>Color</label>
              <select
                value={customization.color || ''}
                onChange={(e) => handleChange('color', e.target.value)}
                className="form-select"
              >
                {product.colors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>
          )}

          {/* Material Selection */}
          {product.materials && product.materials.length > 0 && (
            <div className="form-group">
              <label>Material</label>
              <select
                value={customization.material || ''}
                onChange={(e) => handleChange('material', e.target.value)}
                className="form-select"
              >
                {product.materials.map(material => (
                  <option key={material} value={material}>{material}</option>
                ))}
              </select>
            </div>
          )}

          {/* Pattern Selection (for carpets) */}
          {product.patterns && product.patterns.length > 0 && (
            <div className="form-group">
              <label>Pattern</label>
              <select
                value={customization.pattern || ''}
                onChange={(e) => handleChange('pattern', e.target.value)}
                className="form-select"
              >
                {product.patterns.map(pattern => (
                  <option key={pattern} value={pattern}>{pattern}</option>
                ))}
              </select>
            </div>
          )}

          {/* Thread Count (for bedsheets) */}
          {product.threadCounts && product.threadCounts.length > 0 && (
            <div className="form-group">
              <label>Thread Count</label>
              <select
                value={customization.threadCount || ''}
                onChange={(e) => handleChange('threadCount', e.target.value)}
                className="form-select"
              >
                {product.threadCounts.map(tc => (
                  <option key={tc} value={tc}>{tc}</option>
                ))}
              </select>
            </div>
          )}

          {/* Bag-specific customizations */}
          {product.category === 'bags' && (
            <>
              <div className="form-group">
                <label>Fabric Type</label>
                <select
                  value={customization.fabricType || 'cotton'}
                  onChange={(e) => handleChange('fabricType', e.target.value)}
                  className="form-select"
                >
                  <option value="cotton">Cotton (Standard)</option>
                  <option value="premium">Premium Cotton (+₹199)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Custom Text / Name</label>
                <input
                  type="text"
                  value={customization.customText || ''}
                  onChange={(e) => handleChange('customText', e.target.value)}
                  placeholder="Enter name or text"
                  className="form-input"
                  maxLength={20}
                />
                <small className="form-hint">+₹99 for text printing</small>
              </div>

              <div className="form-group">
                <label>Image / Logo</label>
                {customization.imagePreview ? (
                  <div className="image-preview-container">
                    <img src={customization.imagePreview} alt="Preview" className="uploaded-image-preview" />
                    <button type="button" className="remove-image-btn" onClick={removeImage}>Remove</button>
                  </div>
                ) : (
                  <div className="upload-area" onClick={() => document.getElementById('image-upload')?.click()}>
                    <span>📷</span>
                    <p>Click to upload image or logo</p>
                    <small>+₹149 for image printing</small>
                  </div>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>
            </>
          )}

          {/* Price Display */}
          <div className="price-display-modal">
            <div className="price-breakdown">
              <div className="price-item">
                <span>Base Price</span>
                <span>₹{product.basePrice || product.price}</span>
              </div>
              {product.category === 'bags' && customization.fabricType === 'premium' && (
                <div className="price-item">
                  <span>Premium Fabric</span>
                  <span>+₹199</span>
                </div>
              )}
              {product.category === 'bags' && customization.customText && (
                <div className="price-item">
                  <span>Name Print</span>
                  <span>+₹99</span>
                </div>
              )}
              {product.category === 'bags' && customization.imageUpload && (
                <div className="price-item">
                  <span>Image Print</span>
                  <span>+₹149</span>
                </div>
              )}
              <div className="price-total">
                <span>Total</span>
                <span>₹{price.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="modal-actions">
            <button className="add-to-cart-btn-large" onClick={handleSubmit}>
              Add to Cart - ₹{price.toLocaleString('en-IN')}
            </button>
            <button className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
