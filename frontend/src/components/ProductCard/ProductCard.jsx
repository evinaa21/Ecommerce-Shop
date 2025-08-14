import React, { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatPrice, getFirstPrice } from '../../utils/priceUtils';
import { createDefaultAttributes } from '../../utils/cartUtils';
import { getProductTestId } from '../../utils/testUtils';
import './ProductCard.css';

// Memoize the component to prevent unnecessary re-renders
const ProductCard = memo(({ product }) => {
  const { addToCart } = useCart();
  const { name, in_stock, gallery, prices, id, attributes } = product;

  const price = getFirstPrice(prices);
  
  // Memoize event handlers
  const handleQuickShop = useCallback((e) => {
    e.preventDefault(); 
    const defaultAttributes = createDefaultAttributes(attributes);
    addToCart(product, defaultAttributes);
  }, [product, attributes, addToCart]);

  return (
    <Link to={`/product/${id}`} className="product-card-link">
      <div
        className={`product-card ${!in_stock ? 'out-of-stock' : ''}`}
        data-testid={getProductTestId(name)}
      >
        <div className="image-container">
          <img 
            src={gallery[0]} 
            alt={name} 
            className="product-image"
            loading="lazy" // Add lazy loading
            width="350"
            height="350"
          />
          {!in_stock && <div className="out-of-stock-overlay">OUT OF STOCK</div>}
          {in_stock && (
            <button onClick={handleQuickShop} className="quick-shop-button" aria-label="Add to cart">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3H5.25L7.5 15.75H18.75L21 6.75H6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8.25 19.5C8.25 20.3284 7.57843 21 6.75 21C5.92157 21 5.25 20.3284 5.25 19.5C5.25 18.6716 5.92157 18 6.75 18C7.57843 18 8.25 18.6716 8.25 19.5Z" fill="white"/>
                <path d="M19.5 19.5C19.5 20.3284 18.8284 21 18 21C17.1716 21 16.5 20.3284 16.5 19.5C16.5 18.6716 17.1716 18 18 18C18.8284 18 19.5 18.6716 19.5 19.5Z" fill="white"/>
              </svg>
            </button>
          )}
        </div>
        <div className="product-info">
          <p className="product-name">{name}</p>
          <p className="product-price">{formatPrice(price.amount, price.currency_symbol)}</p>
        </div>
      </div>
    </Link>
  );
});

ProductCard.displayName = 'ProductCard';
export default ProductCard;