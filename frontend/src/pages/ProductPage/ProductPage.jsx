import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_PRODUCT_BY_ID } from '../../graphql/queries';
import { useCart } from '../../context/CartContext';
import { useProductAttributes } from '../../hooks/useProductAttributes';
import ProductGallery from '../../components/ProductGallery/ProductGallery';
import ProductInfo from '../../components/ProductInfo/ProductInfo';
import './ProductPage.css';

const ProductPage = () => {
  const { productId } = useParams();
  const { addToCart, setIsCartOpen, setCurrentCategory } = useCart();
  
  const { loading, error, data } = useQuery(GET_PRODUCT_BY_ID, {
    variables: { id: productId },
    fetchPolicy: 'network-only',
  });

  const product = data?.product;
  
  const {
    selectedAttributes,
    selectAttribute,
    isComplete
  } = useProductAttributes(product?.attributes);

  useEffect(() => {
    if (product?.category) {
      setCurrentCategory(product.category);
    }
  }, [product, setCurrentCategory]);

  if (loading) return <div className="loading">Loading product...</div>;
  if (error) return <div className="error">Error loading product: {error.message}</div>;
  if (!product) return <div className="error">Product not found</div>;

  const isAddToCartDisabled = () => {
    return !product.in_stock || !isComplete;
  };

  const handleAddToCart = () => {
    if (isAddToCartDisabled()) return;
    
    const success = addToCart(product, selectedAttributes);
    if (success) {
      setIsCartOpen(true);
    }
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
          onAttributeSelect={selectAttribute}
          onAddToCart={handleAddToCart}
          isAddToCartDisabled={isAddToCartDisabled}
        />
      </div>
    </div>
  );
};

export default ProductPage;