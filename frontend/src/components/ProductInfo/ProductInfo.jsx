import React from 'react';
import ProductAttributes from '../ProductAttributes/ProductAttributes';
import './ProductInfo.css';

const ProductInfo = ({ 
  product, 
  selectedAttributes, 
  onAttributeSelect, 
  onAddToCart, 
  isAddToCartDisabled 
}) => {
  const parseDescription = (html) => {
    return html
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<[^>]*>/g, '')
      .trim();
  };

  const price = product.prices[0];

  return (
    <div className="product-info">
      <h1 className="product-name">{product.name}</h1>
      
      <ProductAttributes
        attributes={product.attributes}
        selectedAttributes={selectedAttributes}
        onAttributeSelect={onAttributeSelect}
      />

      <div className="product-price">
        <span className="price-label">Price:</span>
        <span className="price-amount">
          {price.currency_symbol}{price.amount.toFixed(2)}
        </span>
      </div>

      <button
        className={`add-to-cart-btn ${isAddToCartDisabled() ? 'disabled' : ''}`}
        onClick={onAddToCart}
        disabled={isAddToCartDisabled()}
        data-testid="add-to-cart"
      >
        {!product.in_stock ? 'OUT OF STOCK' : 'ADD TO CART'}
      </button>

      <div className="product-description" data-testid="product-description">
        <div className="description-content">
          {parseDescription(product.description || '').split('\n').map((paragraph, index) => (
            paragraph.trim() && <p key={index}>{paragraph.trim()}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;