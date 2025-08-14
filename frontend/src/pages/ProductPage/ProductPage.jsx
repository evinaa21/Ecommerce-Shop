import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_PRODUCT_BY_ID } from '../../graphql/queries';
import { useCart } from '../../context/CartContext';
import ProductGallery from '../../components/ProductGallery/ProductGallery';
import ProductInfo from '../../components/ProductInfo/ProductInfo';
import './ProductPage.css';

const ProductPage = () => {
  const { productId } = useParams();
  const { addToCart, setIsCartOpen, setCurrentCategory } = useCart();
  const [selectedAttributes, setSelectedAttributes] = useState({});
  
  const { loading, error, data } = useQuery(GET_PRODUCT_BY_ID, {
    variables: { id: productId },
    fetchPolicy: 'network-only',
  });

  const product = data?.product;

  useEffect(() => {
    if (product?.category) {
      setCurrentCategory(product.category);
    }
  }, [product, setCurrentCategory]);

  useEffect(() => {
    if (product?.attributes) {
      const initialAttributes = {};
      product.attributes.forEach((attr) => {
        initialAttributes[attr.id] = '';
      });
      setSelectedAttributes(initialAttributes);
    }
  }, [product]);

  if (loading) return <div className="loading">Loading product...</div>;
  if (error) return <div className="error">Error loading product: {error.message}</div>;
  if (!product) return <div className="error">Product not found</div>;

  const handleAttributeSelect = (attributeId, value) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [attributeId]: value
    }));
  };

  const isAddToCartDisabled = () => {
    if (!product.in_stock) return true;
    return product.attributes.some(attr => !selectedAttributes[attr.id]);
  };

  const handleAddToCart = () => {
    if (isAddToCartDisabled()) return;
    addToCart(product, selectedAttributes);
    setIsCartOpen(true);
  };

  return (
    <div className="product-page">
      <div className="product-container">
        <ProductGallery 
          gallery={product.gallery} 
          productName={product.name} 
        />
        <ProductInfo
          product={product}
          selectedAttributes={selectedAttributes}
          onAttributeSelect={handleAttributeSelect}
          onAddToCart={handleAddToCart}
          isAddToCartDisabled={isAddToCartDisabled}
        />
      </div>
    </div>
  );
};

export default ProductPage;