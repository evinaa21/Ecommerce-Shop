import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/Header/Header';
import CategoryPage from './pages/CategoryPage/CategoryPage';
import CartOverlay from './components/CartOverlay/CartOverlay';
import SuccessMessage from './components/SuccessMessage/SuccessMessage';
import { useCart } from './context/CartContext';
import './App.css';

function App() {
  const { successMessage } = useCart();

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/category/all" replace />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          {/* <Route path="/product/:productId" element={<ProductPage />} /> */}
        </Routes>
      </main>
      <CartOverlay />
      <SuccessMessage message={successMessage} />
    </div>
  );
}

export default App;
