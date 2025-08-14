import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_CATEGORIES } from '../../graphql/queries';
import { useCart } from '../../context/CartContext';
import './Header.css';
import logo from '../../assets/icon.png';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { loading, error, data, refetch } = useQuery(GET_CATEGORIES, {
    fetchPolicy: 'cache-first',
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
    onError: (error) => {
      console.error('Categories query error:', error);
      // Auto-retry after 2 seconds
      setTimeout(() => {
        refetch();
      }, 2000);
    }
  });
  const { cartItems, isCartOpen, setIsCartOpen, currentCategory } = useCart();

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Fallback categories in case of error
  const fallbackCategories = [
    { name: 'all' },
    { name: 'clothes' },
    { name: 'tech' }
  ];

  // Use data categories if available, otherwise use fallback
  const categories = data?.categories ? 
    [{ name: 'all' }, ...data.categories] : 
    fallbackCategories;

  const handleCartToggle = () => {
    setIsCartOpen(!isCartOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isCategoryActive = (categoryName) => {
    const currentPath = location.pathname.substring(1);
    
    if (currentPath === categoryName) {
      return true;
    }
    
    if (location.pathname.startsWith('/product/')) {
      return currentCategory === categoryName;
    }
    
    return false;
  };

  // Show loading state with basic navigation
  if (loading && !data) {
    return (
      <header className="header">
        <nav className="header-nav">
          {fallbackCategories.map((category) => (
            <NavLink
              key={category.name}
              to={`/${category.name}`}
              className="nav-link"
            >
              {category.name.toUpperCase()}
            </NavLink>
          ))}
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
  }

  // Show error state with retry button
  if (error && !data) {
    return (
      <header className="header">
        <div className="error-state">
          <span>Error loading categories</span>
          <button onClick={() => refetch()} className="retry-btn">
            Retry
          </button>
        </div>
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
  }

  return (
    <header className="header">
      <button 
        className="mobile-menu-btn"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav className={`header-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {categories.map((category) => {
          const { name } = category;
          const isActive = isCategoryActive(name);
          
          return (
            <NavLink
              key={name}
              to={`/${name}`}
              className={isActive ? 'nav-link active' : 'nav-link'}
              data-testid={isActive ? 'active-category-link' : 'category-link'}
              onClick={closeMobileMenu}
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
        <button
          onClick={handleCartToggle}
          className="cart-btn"
          data-testid="cart-btn"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1H3.63636L5.39091 11.8545H16.3636L19 4.54545H4.54545" stroke="#1D1F22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6.27271 15.4545C6.27271 16.3335 5.55626 17.0499 4.67727 17.0499C3.79828 17.0499 3.08182 16.3335 3.08182 15.4545C3.08182 14.5755 3.79828 13.8591 4.67727 13.8591C5.55626 13.8591 6.27271 14.5755 6.27271 15.4545Z" stroke="#1D1F22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17.2727 15.4545C17.2727 16.3335 16.5563 17.0499 15.6773 17.0499C14.7983 17.0499 14.0818 16.3335 14.0818 15.4545C14.0818 14.5755 14.7983 13.8591 15.6773 13.8591C16.5563 13.8591 17.2727 14.5755 17.2727 15.4545Z" stroke="#1D1F22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17.2727 15.4545C17.2727 16.3335 16.5563 17.0499 15.6773 17.0499C14.7983 17.0499 14.0818 16.3335 14.0818 15.4545C14.0818 14.5755 14.7983 13.8591 15.6773 13.8591C16.5563 13.8591 17.2727 14.5755 17.2727 15.4545Z" stroke="#1D1F22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {totalItems > 0 && <span className="cart-item-count">{totalItems}</span>}
        </button>
      </div>
    </header>
  );
};

export default Header;