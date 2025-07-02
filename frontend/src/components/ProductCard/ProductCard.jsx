import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { name, in_stock, gallery, prices, id, attributes } = product;
  const { addToCart } = useCart();

  const price = prices[0]; // Assuming the first price is the one to display

  const handleQuickShop = (e) => {
    e.preventDefault(); // Prevent navigating to PDP on button click
    const defaultAttributes = attributes.reduce((acc, attr) => {
      acc[attr.id] = attr.items[0].value; // Select the first option's value for each attribute
      return acc;
    }, {});
    addToCart(product, defaultAttributes);
    alert(`${name} added to cart!`); // Optional: give user feedback
  };

  const kebabCaseName = name.replace(/\s+/g, '-').toLowerCase();

  return (
    <Link to={`/product/${id}`} className="product-card-link">
      <div
        className={`product-card ${!in_stock ? 'out-of-stock' : ''}`}
        data-testid={`product-${kebabCaseName}`}
      >
        <div className="image-container">
          <img src={gallery[0]} alt={name} className="product-image" />
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
          <p className="product-price">{`${price.currency_symbol}${price.amount.toFixed(2)}`}</p>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;