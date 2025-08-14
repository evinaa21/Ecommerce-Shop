import React from 'react';
import ProductAttributes from '../ProductAttributes/ProductAttributes';
import { formatPrice, getFirstPrice } from '../../utils/priceUtils';
import { sanitizeHtml } from '../../utils/htmlUtils';
import './ProductInfo.css';

const ProductInfo = ({ 
  product, 
  selectedAttributes, 
  onAttributeSelect, 
  onAddToCart, 
  isAddToCartDisabled 
}) => {
  const price = getFirstPrice(product.prices);

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
          {formatPrice(price.amount, price.currency_symbol)}
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
        <div 
          className="description-content"
          dangerouslySetInnerHTML={{ 
            __html: sanitizeHtml(product.description || '') 
          }}
        />
      </div>
    </div>
  );
};

export default ProductInfo;