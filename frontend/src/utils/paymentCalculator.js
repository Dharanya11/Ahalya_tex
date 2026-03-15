/**
 * Secure Payment Calculation Utility
 * Handles all payment calculations with validation and error handling
 */

export class PaymentCalculator {
  /**
   * Validate input values for payment calculation
   * @param {number} price - Product price
   * @param {number} quantity - Product quantity
   * @param {number} discount - Discount percentage (0-100)
   * @param {number} tax - Tax percentage (0-100)
   * @param {number} shipping - Shipping charges
   * @returns {Object} Validation result
   */
  static validateInputs(price, quantity, discount, tax, shipping) {
    const errors = [];
    
    // Validate price
    if (typeof price !== 'number' || isNaN(price)) {
      errors.push('Price must be a valid number');
    } else if (price < 0) {
      errors.push('Price cannot be negative');
    } else if (price > 999999.99) {
      errors.push('Price exceeds maximum allowed amount');
    }
    
    // Validate quantity
    if (typeof quantity !== 'number' || isNaN(quantity)) {
      errors.push('Quantity must be a valid number');
    } else if (quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    } else if (!Number.isInteger(quantity)) {
      errors.push('Quantity must be a whole number');
    } else if (quantity > 1000) {
      errors.push('Quantity exceeds maximum allowed amount');
    }
    
    // Validate discount
    if (typeof discount !== 'number' || isNaN(discount)) {
      errors.push('Discount must be a valid number');
    } else if (discount < 0) {
      errors.push('Discount cannot be negative');
    } else if (discount > 100) {
      errors.push('Discount cannot exceed 100%');
    }
    
    // Validate tax
    if (typeof tax !== 'number' || isNaN(tax)) {
      errors.push('Tax must be a valid number');
    } else if (tax < 0) {
      errors.push('Tax cannot be negative');
    } else if (tax > 100) {
      errors.push('Tax cannot exceed 100%');
    }
    
    // Validate shipping
    if (typeof shipping !== 'number' || isNaN(shipping)) {
      errors.push('Shipping charges must be a valid number');
    } else if (shipping < 0) {
      errors.push('Shipping charges cannot be negative');
    } else if (shipping > 10000) {
      errors.push('Shipping charges exceed maximum allowed amount');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Round currency value to 2 decimal places
   * @param {number} value - Value to round
   * @returns {number} Rounded value
   */
  static roundCurrency(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  /**
   * Calculate payment breakdown
   * @param {Object} params - Payment parameters
   * @param {number} params.price - Product price
   * @param {number} params.quantity - Product quantity
   * @param {number} params.discount - Discount percentage (0-100)
   * @param {number} params.tax - Tax percentage (0-100)
   * @param {number} params.shipping - Shipping charges
   * @returns {Object} Calculation result
   */
  static calculatePayment({ price, quantity, discount, tax, shipping }) {
    // Validate inputs
    const validation = this.validateInputs(price, quantity, discount, tax, shipping);
    
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    try {
      // Calculate subtotal
      const subtotal = this.roundCurrency(price * quantity);
      
      // Calculate discount amount
      const discountAmount = this.roundCurrency(subtotal * (discount / 100));
      
      // Calculate amount after discount
      const discountedAmount = this.roundCurrency(subtotal - discountAmount);
      
      // Calculate tax amount
      const taxAmount = this.roundCurrency(discountedAmount * (tax / 100));
      
      // Calculate final total
      const finalTotal = this.roundCurrency(discountedAmount + taxAmount + shipping);
      
      // Return structured result
      return {
        success: true,
        calculation: {
          price: this.roundCurrency(price),
          quantity: Math.floor(quantity),
          subtotal: subtotal,
          discount: {
            percentage: this.roundCurrency(discount),
            amount: discountAmount
          },
          tax: {
            percentage: this.roundCurrency(tax),
            amount: taxAmount
          },
          shipping: this.roundCurrency(shipping),
          final_total: finalTotal
        },
        breakdown: {
          item_price: this.roundCurrency(price),
          quantity: Math.floor(quantity),
          subtotal: subtotal,
          discount_amount: discountAmount,
          tax_amount: taxAmount,
          shipping_charges: this.roundCurrency(shipping),
          payable_amount: finalTotal
        },
        metadata: {
          calculated_at: new Date().toISOString(),
          currency: 'INR',
          precision: 2
        }
      };
    } catch (error) {
      throw new Error(`Calculation error: ${error.message}`);
    }
  }

  /**
   * Calculate payment for multiple items
   * @param {Array} items - Array of items with price, quantity, discount
   * @param {number} tax - Overall tax percentage
   * @param {number} shipping - Shipping charges
   * @returns {Object} Calculation result
   */
  static calculateMultipleItems(items, tax, shipping) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Items array is required and cannot be empty');
    }

    let totalSubtotal = 0;
    let totalDiscount = 0;
    const itemBreakdowns = [];

    // Calculate each item
    items.forEach((item, index) => {
      try {
        const itemCalculation = this.calculatePayment({
          price: item.price,
          quantity: item.quantity,
          discount: item.discount || 0,
          tax: 0, // Tax calculated on total
          shipping: 0 // Shipping calculated separately
        });

        totalSubtotal += itemCalculation.calculation.subtotal;
        totalDiscount += itemCalculation.calculation.discount.amount;
        
        itemBreakdowns.push({
          index: index,
          name: item.name || `Item ${index + 1}`,
          ...itemCalculation.calculation
        });
      } catch (error) {
        throw new Error(`Item ${index + 1}: ${error.message}`);
      }
    });

    // Calculate overall tax and shipping
    const discountedTotal = this.roundCurrency(totalSubtotal - totalDiscount);
    const taxAmount = this.roundCurrency(discountedTotal * (tax / 100));
    const finalTotal = this.roundCurrency(discountedTotal + taxAmount + shipping);

    return {
      success: true,
      calculation: {
        items: itemBreakdowns,
        subtotal: this.roundCurrency(totalSubtotal),
        discount: {
          percentage: 0, // Individual item discounts handled separately
          amount: this.roundCurrency(totalDiscount)
        },
        tax: {
          percentage: this.roundCurrency(tax),
          amount: taxAmount
        },
        shipping: this.roundCurrency(shipping),
        final_total: finalTotal
      },
      breakdown: {
        items_count: items.length,
        subtotal: this.roundCurrency(totalSubtotal),
        discount_amount: this.roundCurrency(totalDiscount),
        tax_amount: taxAmount,
        shipping_charges: this.roundCurrency(shipping),
        payable_amount: finalTotal
      },
      metadata: {
        calculated_at: new Date().toISOString(),
        currency: 'INR',
        precision: 2
      }
    };
  }

  /**
   * Format currency for display
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code
   * @returns {string} Formatted currency string
   */
  static formatCurrency(amount, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Generate payment summary for display
   * @param {Object} calculation - Calculation result
   * @returns {Object} Formatted summary
   */
  static generateSummary(calculation) {
    if (!calculation.success) {
      throw new Error('Invalid calculation result');
    }

    const { calculation: calc } = calculation;
    
    return {
      header: {
        title: 'Order Summary',
        currency: calculation.metadata.currency,
        calculated_at: calculation.metadata.calculated_at
      },
      items: calc.items || [calc],
      totals: {
        subtotal: {
          label: 'Subtotal',
          value: calc.subtotal,
          formatted: this.formatCurrency(calc.subtotal)
        },
        discount: {
          label: 'Discount',
          value: calc.discount.amount,
          formatted: this.formatCurrency(calc.discount.amount),
          percentage: calc.discount.percentage
        },
        tax: {
          label: `Tax (${calc.tax.percentage}%)`,
          value: calc.tax.amount,
          formatted: this.formatCurrency(calc.tax.amount)
        },
        shipping: {
          label: 'Shipping',
          value: calc.shipping,
          formatted: this.formatCurrency(calc.shipping)
        },
        total: {
          label: 'Total Amount',
          value: calc.final_total,
          formatted: this.formatCurrency(calc.final_total),
          highlight: true
        }
      }
    };
  }
}

// Export utility functions for easy access
export const calculatePayment = PaymentCalculator.calculatePayment.bind(PaymentCalculator);
export const calculateMultipleItems = PaymentCalculator.calculateMultipleItems.bind(PaymentCalculator);
export const formatCurrency = PaymentCalculator.formatCurrency.bind(PaymentCalculator);
export const validatePaymentInputs = PaymentCalculator.validateInputs.bind(PaymentCalculator);

export default PaymentCalculator;
