import React from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS_BY_CATEGORY } from '../../graphql/queries';
import ProductCard from '../../components/ProductCard/ProductCard';
import './CategoryPage.css';

const CategoryPage = () => {
  const location = useLocation();
  // Get category name directly from URL (remove leading slash)
  const categoryName = location.pathname.substring(1);
  
  const { loading, error, data } = useQuery(GET_PRODUCTS_BY_CATEGORY, {
    variables: { title: categoryName },
    fetchPolicy: 'network-only',
  });

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error loading products: {error.message}</p>;

  const { name, products } = data.category;

  return (
    <div className="category-page">
      <h1 className="category-title">{name}</h1>
      <div className="product-list">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;