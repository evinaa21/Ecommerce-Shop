import React from 'react';
import './CartItemControls.css';

const CartItemControls = ({ cartId, quantity, onUpdateQuantity, image, name }) => {
  return (
    <div className="cart-item-controls">
      <div className="quantity-controls">
        <button onClick={() => onUpdateQuantity(cartId, 1)} data-testid="cart-item-amount-increase">
          +
        </button>
        <span data-testid="cart-item-amount">{quantity}</span>
        <button onClick={() => onUpdateQuantity(cartId, -1)} data-testid="cart-item-amount-decrease">
          −
        </button>
      </div>
      <div className="item-image-container">
        <img src={image} alt={name} className="item-image" />
      </div>
    </div>
  );
};

export default CartItemControls;