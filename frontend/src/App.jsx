import React, { useEffect } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header/Header';
import CategoryPage from './pages/CategoryPage/CategoryPage';
import ProductPage from './pages/ProductPage/ProductPage';
import CartOverlay from './components/CartOverlay/CartOverlay';
import SuccessMessage from './components/SuccessMessage/SuccessMessage';
import { useCart } from './context/CartContext';
import './App.css';

function App() {
  const { successMessage } = useCart();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/all') {
      document.title = 'All Products | Ecommerce Shop';
    } else if (location.pathname === '/clothes') {
      document.title = 'Clothes | Ecommerce Shop';
    } else if (location.pathname === '/tech') {
      document.title = 'Tech | Ecommerce Shop';
    } else if (location.pathname.startsWith('/product/')) {
      document.title = 'Product Details | Ecommerce Shop';
    } else {
      document.title = 'Ecommerce Shop';
    }
  }, [location.pathname]);

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/all" replace />} />
          <Route path="/all" element={<CategoryPage />} />
          <Route path="/clothes" element={<CategoryPage />} />
          <Route path="/tech" element={<CategoryPage />} />
          <Route path="/product/:productId" element={<ProductPage />} />
        </Routes>
      </main>
      <CartOverlay />
      <SuccessMessage message={successMessage} />
    </div>
  );
}

export default App;
