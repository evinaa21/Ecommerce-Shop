import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_CATEGORIES } from '../../graphql/queries';
import CategoryPage from '../../pages/CategoryPage/CategoryPage';
import ProductPage from '../../pages/ProductPage/ProductPage';

const DynamicRouter = () => {
  const { loading, error, data, refetch } = useQuery(GET_CATEGORIES, {
    fetchPolicy: 'cache-first',
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
    onError: (error) => {
      console.error('Router categories query error:', error);
    }
  });

  // Fallback categories
  const fallbackCategories = [
    { name: 'all' },
    { name: 'clothes' },
    { name: 'tech' }
  ];

  // Use data categories if available, otherwise use fallback
  const categories = data?.categories ? 
    [{ name: 'all' }, ...data.categories] : 
    fallbackCategories;

  if (loading && !data) {
    return (
      <div className="router-loading">
        <p>Loading routes...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="router-error">
        <p>Error loading routes: {error.message}</p>
        <button onClick={() => refetch()} className="retry-btn">
          Retry Loading Routes
        </button>
      </div>
    );
  }

  return (
    <Routes>
      {/* Redirect root to /all */}
      <Route path="/" element={<Navigate to="/all" replace />} />
      
      {/* Dynamic category routes */}
      {categories.map((category) => (
        <Route
          key={category.name}
          path={`/${category.name}`}
          element={<CategoryPage />}
        />
      ))}
      
      {/* Product detail route */}
      <Route path="/product/:productId" element={<ProductPage />} />
      
      {/* Catch-all route for unknown categories - redirect to all */}
      <Route path="*" element={<Navigate to="/all" replace />} />
    </Routes>
  );
};

export default DynamicRouter;