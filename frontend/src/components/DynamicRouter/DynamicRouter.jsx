import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_CATEGORIES } from '../../graphql/queries';
import CategoryPage from '../../pages/CategoryPage/CategoryPage';
import ProductPage from '../../pages/ProductPage/ProductPage';

const DynamicRouter = () => {
  const { loading, error, data } = useQuery(GET_CATEGORIES);

  if (loading) return <div>Loading routes...</div>;
  if (error) return <div>Error loading routes: {error.message}</div>;

  // Always include 'all' as the first category, then add dynamic categories
  const categories = [
    { name: 'all' },
    ...(data?.categories || [])
  ];

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