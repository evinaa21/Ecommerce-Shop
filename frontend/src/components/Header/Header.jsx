import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_CATEGORIES } from '../../graphql/queries';
import { useCart } from '../../context/CartContext';
import './Header.css';
import logo from '../../assets/icon.png'; // Import the logo

const Header = () => {
  const location = useLocation();
  const { loading, error, data } = useQuery(GET_CATEGORIES);
  const { cartItems, isCartOpen, setIsCartOpen, currentCategory } = useCart();

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Function to determine if a category should be active
  const isCategoryActive = (categoryName) => {
    const pathParts = location.pathname.split('/');
    
    // If we're on a category page, check if it matches
    if (pathParts[1] === 'category' && pathParts[2] === categoryName) {
      return true;
    }
    
    // If we're on a product page, check if it matches the current category
    if (pathParts[1] === 'product' && currentCategory === categoryName) {
      return true;
    }
    
    return false;
  };

  const handleCartToggle = () => {
    if (isCartOpen) {
      // If cart is open, close it (CartOverlay will handle the animation)
      setIsCartOpen(false);
    } else {
      // If cart is closed, open it
      setIsCartOpen(true);
    }
  };

  return (
    <header className="header">
      <nav className="header-nav">
        {loading && <p>Loading...</p>}
        {error && <p>Error.</p>}
        {data &&
          data.categories.map((category) => {
            const { name } = category;
            
            // Map backend category names to frontend URLs
            const urlMapping = {
              'tech': 'tech',  // Keep tech as tech instead of mapping to electronics
              'clothes': 'clothes',
              'all': 'all'
            };
            
            const urlPath = urlMapping[name] || name;
            const isActive = location.pathname === `/${urlPath}`;
            
            return (
              <NavLink
                key={name}
                to={`/${urlPath}`}  // Use mapped URL path
                className={isActive ? 'nav-link active' : 'nav-link'}
                data-testid={isActive ? 'active-category-link' : 'category-link'}
              >
                {name.toUpperCase()}
              </NavLink>
            );
          })}
      </nav>
      <div className="header-logo">
        <img src={logo} alt="Shop Logo" className="logo-image" />
      </div>
      <div className="header-actions">
        <button onClick={handleCartToggle} className="cart-btn" data-testid="cart-btn">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1H3.63636L5.39091 11.8545H16.3636L19 4.54545H4.54545" stroke="#1D1F22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6.27271 15.4545C6.27271 16.3335 5.55626 17.0499 4.67727 17.0499C3.79828 17.0499 3.08182 16.3335 3.08182 15.4545C3.08182 14.5755 3.79828 13.8591 4.67727 13.8591C5.55626 13.8591 6.27271 14.5755 6.27271 15.4545Z" stroke="#1D1F22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17.2727 15.4545C17.2727 16.3335 16.5563 17.0499 15.6773 17.0499C14.7983 17.0499 14.0818 16.3335 14.0818 15.4545C14.0818 14.5755 14.7983 13.8591 15.6773 13.8591C16.5563 13.8591 17.2727 14.5755 17.2727 15.4545Z" stroke="#1D1F22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {totalItems > 0 && <span className="cart-item-count">{totalItems}</span>}
        </button>
      </div>
    </header>
  );
};

export default Header;