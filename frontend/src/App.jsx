import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/Header/Header';
import CategoryPage from './pages/CategoryPage/CategoryPage';
import './App.css';

function App() {
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
    </div>
  );
}

export default App;
