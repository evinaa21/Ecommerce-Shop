import React from 'react';
import './CartSummary.css';

const CartSummary = ({ totalItems, totalPrice, currencySymbol, onPlaceOrder, loading, disabled }) => {
  return (
    <div className="cart-summary">
      <div className="cart-total" data-testid="cart-total">
        <span>Total</span>
        <span>{currencySymbol}{totalPrice.toFixed(2)}</span>
      </div>
      <div className="cart-actions">
        <button
          className="place-order-btn"
          onClick={onPlaceOrder}
          disabled={disabled || loading}
        >
          {loading ? 'PLACING ORDER...' : 'PLACE ORDER'}
        </button>
      </div>
    </div>
  );
};

export default CartSummary;