import React from 'react';
import { useCart } from '../../context/CartContext';
import CartItemControls from '../CartItemControls/CartItemControls';
import './CartItem.css';

const CartItem = ({ item }) => {
  const { updateQuantity } = useCart();
  const { name, brand, prices, attributes, gallery, quantity, cartId, selectedAttributes } = item;
  
  const price = prices && prices.length > 0 ? prices[0] : null;

  const kebabCase = (str) => str ? str.replace(/\s+/g, '-').toLowerCase() : '';

  return (
    <div className="cart-item" data-testid={`cart-item-${cartId}`}>
      <div className="item-details">
        <p className="item-name">{name}</p>
        {price && (
          <p className="item-price">{`${price.currency_symbol}${price.amount.toFixed(2)}`}</p>
        )}
        
        {attributes && attributes.map((attr) => (
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
                    aria-label={`Select ${attr.name} ${option.display_value}`}
                    disabled
                  >
                    {attr.type !== 'swatch' && option.value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      <CartItemControls
        cartId={cartId}
        quantity={quantity}
        onUpdateQuantity={updateQuantity}
        image={gallery[0]}
        name={name}
      />
    </div>
  );
};

export default CartItem;