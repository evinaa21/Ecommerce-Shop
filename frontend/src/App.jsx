import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './components/Header/Header';
import DynamicRouter from './components/DynamicRouter/DynamicRouter';
import CartOverlay from './components/CartOverlay/CartOverlay';
import SuccessMessage from './components/SuccessMessage/SuccessMessage';
import { useCart } from './context/CartContext';
import './App.css';

function App() {
  const { successMessage } = useCart();
  const location = useLocation();

  useEffect(() => {
    const pathSegment = location.pathname.substring(1); // Remove leading slash
    
    if (pathSegment === 'all') {
      document.title = 'All Products | Ecommerce Shop';
    } else if (location.pathname.startsWith('/product/')) {
      document.title = 'Product Details | Ecommerce Shop';
    } else if (pathSegment) {
      // Dynamic category title
      const categoryName = pathSegment.charAt(0).toUpperCase() + pathSegment.slice(1);
      document.title = `${categoryName} | Ecommerce Shop`;
    } else {
      document.title = 'Ecommerce Shop';
    }
  }, [location.pathname]);

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <DynamicRouter />
      </main>
      <CartOverlay />
      <SuccessMessage message={successMessage} />
    </div>
  );
}

export default App;
