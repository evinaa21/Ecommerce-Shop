import React from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS_BY_CATEGORY, GET_CATEGORIES } from '../../graphql/queries';
import ProductCard from '../../components/ProductCard/ProductCard';
import './CategoryPage.css';

const CategoryPage = () => {
  const location = useLocation();
  // Extract category from pathname (remove the leading slash)
  const urlCategory = location.pathname.substring(1);
  
  // Map URL category to backend category name
  const categoryMapping = {
    'tech': 'tech',  // Keep tech as tech
    'clothes': 'clothes',
    'all': 'all'
  };
  
  const categoryName = categoryMapping[urlCategory] || urlCategory;
  
  console.log('URL Category:', urlCategory);
  console.log('Mapped Category Name:', categoryName);
  
  // Add this query to see what categories exist
  const { data: categoriesData } = useQuery(GET_CATEGORIES);
  console.log('Available categories:', categoriesData?.categories);
  
  const { loading, error, data } = useQuery(GET_PRODUCTS_BY_CATEGORY, {
    variables: { title: categoryName },
    fetchPolicy: 'network-only',
  });

  console.log('Query data:', data);
  console.log('Query error:', error);

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