/**
 * Payment Validation Utility
 * Comprehensive validation for payment processing and checkout
 */

export class PaymentValidation {
  /**
   * Validate cart items before checkout
   * @param {Array} items - Cart items
   * @returns {Object} Validation result
   */
  static validateCart(items) {
    const errors = [];
    const warnings = [];

    if (!Array.isArray(items)) {
      errors.push('Cart items must be an array');
      return { isValid: false, errors, warnings };
    }

    if (items.length === 0) {
      errors.push('Cart is empty');
      return { isValid: false, errors, warnings };
    }

    let totalQuantity = 0;
    let totalValue = 0;

    items.forEach((item, index) => {
      const itemErrors = [];
      
      // Validate item structure
      if (!item || typeof item !== 'object') {
        errors.push(`Item ${index + 1}: Invalid item structure`);
        return;
      }

      // Validate price
      if (typeof item.price !== 'number' || isNaN(item.price)) {
        itemErrors.push('Invalid price');
      } else if (item.price <= 0) {
        itemErrors.push('Price must be greater than 0');
      } else if (item.price > 999999.99) {
        warnings.push(`Item ${index + 1}: Price exceeds maximum limit`);
      }

      // Validate quantity
      if (typeof item.quantity !== 'number' || isNaN(item.quantity)) {
        itemErrors.push('Invalid quantity');
      } else if (item.quantity <= 0) {
        itemErrors.push('Quantity must be greater than 0');
      } else if (!Number.isInteger(item.quantity)) {
        itemErrors.push('Quantity must be a whole number');
      } else if (item.quantity > 1000) {
        warnings.push(`Item ${index + 1}: Quantity exceeds maximum limit`);
      }

      // Validate discount
      const discount = item.discount || 0;
      if (typeof discount !== 'number' || isNaN(discount)) {
        itemErrors.push('Invalid discount');
      } else if (discount < 0) {
        itemErrors.push('Discount cannot be negative');
      } else if (discount > 100) {
        itemErrors.push('Discount cannot exceed 100%');
      }

      // Validate name
      if (!item.name || typeof item.name !== 'string' || item.name.trim().length === 0) {
        itemErrors.push('Item name is required');
      }

      // Validate product ID
      if (!item.productId || typeof item.productId !== 'string') {
        warnings.push(`Item ${index + 1}: Product ID missing`);
      }

      if (itemErrors.length > 0) {
        errors.push(`Item ${index + 1}: ${itemErrors.join(', ')}`);
      } else {
        totalQuantity += item.quantity;
        totalValue += (item.price * item.quantity);
      }
    });

    // Check total limits
    if (totalQuantity > 10000) {
      errors.push('Total quantity exceeds maximum limit');
    }

    if (totalValue > 10000000) {
      errors.push('Total order value exceeds maximum limit');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        itemCount: items.length,
        totalQuantity,
        totalValue
      }
    };
  }

  /**
   * Validate shipping address
   * @param {Object} address - Shipping address
   * @returns {Object} Validation result
   */
  static validateAddress(address) {
    const errors = [];
    const warnings = [];

    if (!address || typeof address !== 'object') {
      errors.push('Shipping address is required');
      return { isValid: false, errors, warnings };
    }

    // Validate required fields
    const requiredFields = {
      fullName: 'Full name',
      email: 'Email address',
      phone: 'Phone number',
      address: 'Street address',
      city: 'City',
      state: 'State',
      pincode: 'Pincode',
      country: 'Country'
    };

    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!address[field] || typeof address[field] !== 'string' || address[field].trim().length === 0) {
        errors.push(`${label} is required`);
      }
    });

    // Validate email format
    if (address.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
      errors.push('Invalid email format');
    }

    // Validate phone number
    if (address.phone) {
      const cleanPhone = address.phone.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        errors.push('Phone number must be 10 digits');
      }
    }

    // Validate pincode
    if (address.pincode) {
      const cleanPincode = address.pincode.replace(/\D/g, '');
      if (cleanPincode.length !== 6) {
        errors.push('Pincode must be 6 digits');
      }
    }

    // Validate name length
    if (address.fullName && address.fullName.length > 100) {
      warnings.push('Full name is too long');
    }

    // Validate address length
    if (address.address && address.address.length > 500) {
      warnings.push('Address is too long');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate payment method
   * @param {string} method - Payment method
   * @param {Object} options - Additional options
   * @returns {Object} Validation result
   */
  static validatePaymentMethod(method, options = {}) {
    const errors = [];
    const warnings = [];

    const validMethods = ['qr_upi', 'upi', 'card', 'netbanking', 'cod'];
    
    if (!method || typeof method !== 'string') {
      errors.push('Payment method is required');
      return { isValid: false, errors, warnings };
    }

    if (!validMethods.includes(method)) {
      errors.push('Invalid payment method');
    }

    // Method-specific validations
    if (method === 'cod' && options.orderValue > 10000) {
      errors.push('Cash on delivery not available for orders above ₹10,000');
    }

    if (method === 'card' && options.saveCard && !options.cardholderConsent) {
      errors.push('Cardholder consent required for saving card details');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate order before payment processing
   * @param {Object} orderData - Order data
   * @returns {Object} Validation result
   */
  static validateOrder(orderData) {
    const errors = [];
    const warnings = [];

    if (!orderData || typeof orderData !== 'object') {
      errors.push('Order data is required');
      return { isValid: false, errors, warnings };
    }

    // Validate cart
    const cartValidation = this.validateCart(orderData.items);
    if (!cartValidation.isValid) {
      errors.push(...cartValidation.errors);
    }
    warnings.push(...cartValidation.warnings);

    // Validate shipping address
    const addressValidation = this.validateAddress(orderData.shippingAddress);
    if (!addressValidation.isValid) {
      errors.push(...addressValidation.errors);
    }
    warnings.push(...addressValidation.warnings);

    // Validate payment method
    const paymentValidation = this.validatePaymentMethod(
      orderData.paymentMethod,
      {
        orderValue: orderData.totalAmount,
        saveCard: orderData.saveCard,
        cardholderConsent: orderData.cardholderConsent
      }
    );
    if (!paymentValidation.isValid) {
      errors.push(...paymentValidation.errors);
    }
    warnings.push(...paymentValidation.warnings);

    // Validate amounts
    if (typeof orderData.totalAmount !== 'number' || orderData.totalAmount <= 0) {
      errors.push('Invalid total amount');
    }

    if (orderData.totalAmount > 10000000) {
      errors.push('Order amount exceeds maximum limit');
    }

    // Validate user
    if (!orderData.userId || typeof orderData.userId !== 'string') {
      warnings.push('User ID not provided');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        itemCount: orderData.items?.length || 0,
        totalAmount: orderData.totalAmount,
        paymentMethod: orderData.paymentMethod
      }
    };
  }

  /**
   * Sanitize and normalize input data
   * @param {Object} data - Input data
   * @returns {Object} Sanitized data
   */
  static sanitizeData(data) {
    if (!data || typeof data !== 'object') {
      return {};
    }

    const sanitizeString = (str) => {
      if (typeof str !== 'string') return '';
      return str.trim().replace(/[<>]/g, '');
    };

    const sanitizeNumber = (num) => {
      if (typeof num !== 'number' || isNaN(num)) return 0;
      return Math.round(num * 100) / 100;
    };

    const sanitized = {};

    // Sanitize address fields
    if (data.shippingAddress) {
      sanitized.shippingAddress = {
        fullName: sanitizeString(data.shippingAddress.fullName),
        email: sanitizeString(data.shippingAddress.email).toLowerCase(),
        phone: data.shippingAddress.phone ? data.shippingAddress.phone.replace(/\D/g, '') : '',
        address: sanitizeString(data.shippingAddress.address),
        city: sanitizeString(data.shippingAddress.city),
        state: sanitizeString(data.shippingAddress.state),
        pincode: data.shippingAddress.pincode ? data.shippingAddress.pincode.replace(/\D/g, '') : '',
        country: sanitizeString(data.shippingAddress.country) || 'India'
      };
    }

    // Sanitize items
    if (data.items && Array.isArray(data.items)) {
      sanitized.items = data.items.map(item => ({
        productId: sanitizeString(item.productId),
        name: sanitizeString(item.name),
        price: sanitizeNumber(item.price),
        quantity: Math.floor(Math.max(1, sanitizeNumber(item.quantity))),
        discount: Math.max(0, Math.min(100, sanitizeNumber(item.discount || 0))),
        image: sanitizeString(item.image || ''),
        customization: item.customization || {}
      }));
    }

    // Sanitize other fields
    sanitized.paymentMethod = sanitizeString(data.paymentMethod);
    sanitized.totalAmount = sanitizeNumber(data.totalAmount);
    sanitized.saveCard = Boolean(data.saveCard);
    sanitized.cardholderConsent = Boolean(data.cardholderConsent);

    return sanitized;
  }

  /**
   * Generate validation summary for display
   * @param {Object} validationResult - Validation result
   * @returns {Object} Formatted summary
   */
  static generateValidationSummary(validationResult) {
    return {
      isValid: validationResult.isValid,
      hasErrors: validationResult.errors && validationResult.errors.length > 0,
      hasWarnings: validationResult.warnings && validationResult.warnings.length > 0,
      errorCount: validationResult.errors?.length || 0,
      warningCount: validationResult.warnings?.length || 0,
      messages: {
        errors: validationResult.errors || [],
        warnings: validationResult.warnings || []
      },
      summary: validationResult.summary || null
    };
  }
}

// Export utility functions for easy access
export const validateCart = PaymentValidation.validateCart.bind(PaymentValidation);
export const validateAddress = PaymentValidation.validateAddress.bind(PaymentValidation);
export const validatePaymentMethod = PaymentValidation.validatePaymentMethod.bind(PaymentValidation);
export const validateOrder = PaymentValidation.validateOrder.bind(PaymentValidation);
export const sanitizePaymentData = PaymentValidation.sanitizeData.bind(PaymentValidation);

export default PaymentValidation;
