import React from 'react';
import { PaymentCalculator } from '../utils/paymentCalculator';
import './OrderSummary.css';

const OrderSummary = ({ 
  items, 
  tax = 18, 
  shipping = 0, 
  onCalculationComplete,
  showEditButton = false,
  onEditClick 
}) => {
  const [calculation, setCalculation] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    calculateOrderSummary();
  }, [items, tax, shipping]);

  const calculateOrderSummary = async () => {
    if (!items || items.length === 0) {
      setError('No items in cart');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = PaymentCalculator.calculateMultipleItems(items, tax, shipping);
      setCalculation(result);
      
      if (onCalculationComplete) {
        onCalculationComplete(result);
      }
    } catch (err) {
      setError(err.message);
      console.error('Calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatItemName = (item) => {
    return item.name || `Product ${item.id || ''}`;
  };

  const renderLoadingState = () => (
    <div className="order-summary loading">
      <div className="summary-header">
        <h3>Order Summary</h3>
      </div>
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <p>Calculating order total...</p>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="order-summary error">
      <div className="summary-header">
        <h3>Order Summary</h3>
      </div>
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button className="retry-btn" onClick={calculateOrderSummary}>
          Retry Calculation
        </button>
      </div>
    </div>
  );

  const renderSummary = () => {
    if (!calculation || !calculation.success) return null;

    const summary = PaymentCalculator.generateSummary(calculation);
    const { totals } = summary;

    return (
      <div className="order-summary">
        <div className="summary-header">
          <h3>{summary.header.title}</h3>
          {showEditButton && onEditClick && (
            <button className="edit-btn" onClick={onEditClick}>
              Edit Cart
            </button>
          )}
        </div>

        <div className="summary-items">
          {summary.items.map((item, index) => (
            <div key={index} className="summary-item">
              <div className="item-info">
                <h4>{item.name}</h4>
                <div className="item-details">
                  <span className="item-price">{PaymentCalculator.formatCurrency(item.price)}</span>
                  <span className="item-quantity">× {item.quantity}</span>
                </div>
              </div>
              <div className="item-total">
                <span>{PaymentCalculator.formatCurrency(item.subtotal)}</span>
                {item.discount.amount > 0 && (
                  <div className="item-discount">
                    -{PaymentCalculator.formatCurrency(item.discount.amount)} ({item.discount.percentage}%)
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="summary-breakdown">
          <div className="breakdown-row">
            <span>{totals.subtotal.label}</span>
            <span>{totals.subtotal.formatted}</span>
          </div>

          {totals.discount.value > 0 && (
            <div className="breakdown-row discount">
              <span>{totals.discount.label}</span>
              <span>-{totals.discount.formatted}</span>
            </div>
          )}

          <div className="breakdown-row">
            <span>{totals.tax.label}</span>
            <span>{totals.tax.formatted}</span>
          </div>

          <div className="breakdown-row">
            <span>{totals.shipping.label}</span>
            <span>
              {totals.shipping.value === 0 ? 'FREE' : totals.shipping.formatted}
            </span>
          </div>

          <div className="breakdown-row total">
            <span>{totals.total.label}</span>
            <span className="total-amount">{totals.total.formatted}</span>
          </div>
        </div>

        <div className="summary-footer">
          <div className="tax-info">
            <small>
              *GST applicable as per government norms
            </small>
          </div>
          <div className="security-info">
            <div className="security-badge">
              <span className="security-icon">🔒</span>
              <span>Secure Payment</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return renderLoadingState();
  if (error) return renderErrorState();
  return renderSummary();
};

export default OrderSummary;
