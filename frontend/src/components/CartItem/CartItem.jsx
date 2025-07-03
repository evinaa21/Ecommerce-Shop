import React from 'react';
import { useCart } from '../../context/CartContext';
import './CartItem.css';

const CartItem = ({ item }) => {
  const { updateQuantity } = useCart();
  const { name, brand, prices, attributes, gallery, quantity, cartId, selectedAttributes } = item;
  const price = prices[0];

  const kebabCase = (str) => str.replace(/\s+/g, '-').toLowerCase();

  return (
    <div className="cart-item">
      <div className="item-details">
        <p className="item-brand">{brand}</p>
        <p className="item-name">{name}</p>
        <p className="item-price">{`${price.currency_symbol}${price.amount.toFixed(2)}`}</p>
        {attributes.map((attr) => (
          <div key={attr.id} className="item-attributes" data-testid={`cart-item-attribute-${kebabCase(attr.name)}`}>
            <p className="attribute-name">{attr.name}:</p>
            <div className="attribute-options">
              {attr.items.map((option) => {
                const isSelected = selectedAttributes[attr.id] === option.value;
                const testId = `cart-item-attribute-${kebabCase(attr.name)}-${kebabCase(option.value)}`;
                return (
                  <button
                    key={option.value}
                    className={`
                      attribute-button
                      ${attr.type === 'swatch' ? 'swatch' : ''}
                      ${isSelected ? 'selected' : ''}
                    `}
                    style={attr.type === 'swatch' ? { backgroundColor: option.value } : {}}
                    data-testid={isSelected ? `${testId}-selected` : testId}
                  >
                    {attr.type !== 'swatch' && option.display_value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="item-controls">
        <div className="quantity-controls">
          <button onClick={() => updateQuantity(cartId, 1)} data-testid="cart-item-amount-increase">+</button>
          <span data-testid="cart-item-amount">{quantity}</span>
          <button onClick={() => updateQuantity(cartId, -1)} data-testid="cart-item-amount-decrease">−</button>
        </div>
        <div className="item-image-container">
          <img src={gallery[0]} alt={name} className="item-image" />
        </div>
      </div>
    </div>
  );
};

export default CartItem;