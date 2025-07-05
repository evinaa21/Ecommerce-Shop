import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_PRODUCT_BY_ID } from '../../graphql/queries';
import { useCart } from '../../context/CartContext';
import './ProductPage.css';

const ProductPage = () => {
  const { productId } = useParams();
  const { addToCart, setIsCartOpen, setCurrentCategory } = useCart();
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const { loading, error, data } = useQuery(GET_PRODUCT_BY_ID, {
    variables: { id: productId },
    fetchPolicy: 'network-only',
  });

  const product = data?.product;

  // Set current category when product loads
  useEffect(() => {
    if (product?.category) {
      setCurrentCategory(product.category);
    }
  }, [product, setCurrentCategory]);

  // Initialize selected attributes when product loads
  useEffect(() => {
    if (product?.attributes) {
      const initialAttributes = {};
      product.attributes.forEach((attr) => {
        // Don't set default values - let user select them
        initialAttributes[attr.id] = '';
      });
      setSelectedAttributes(initialAttributes);
    }
  }, [product]);

  if (loading) return <div className="loading">Loading product...</div>;
  if (error) return <div className="error">Error loading product: {error.message}</div>;
  if (!product) return <div className="error">Product not found</div>;

  const kebabCase = (str) => str ? str.replace(/\s+/g, '-').toLowerCase() : '';

  const handleAttributeSelect = (attributeId, value) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [attributeId]: value
    }));
  };

  const isAddToCartDisabled = () => {
    if (!product.in_stock) return true;
    
    // Check if all attributes have been selected
    return product.attributes.some(attr => !selectedAttributes[attr.id]);
  };

  const handleAddToCart = () => {
    if (isAddToCartDisabled()) return;
    
    addToCart(product, selectedAttributes);
    setIsCartOpen(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === product.gallery.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.gallery.length - 1 : prev - 1
    );
  };

  const parseDescription = (html) => {
    // Simple HTML parser without dangerouslySetInnerHTML
    return html
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<[^>]*>/g, '')
      .trim();
  };

  const getSizeInitials = (value) => {
    if (!value) return '';
    const words = value.split(' ');
    if (words.length > 1) {
      return words.map(word => {
        if (word.toLowerCase() === 'extra') return 'X';
        return word[0];
      }).join('').toUpperCase();
    }
    return value[0].toUpperCase();
  };

  const price = product.prices[0];

  return (
    <div className="product-page">
      <div className="product-container">
        {/* Product Gallery */}
        <div className="product-gallery" data-testid="product-gallery">
          <div className="gallery-thumbnails">
            {product.gallery.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${product.name} ${index + 1}`}
                className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
          <div className="gallery-main">
            <div className="main-image-container">
              <img
                src={product.gallery[currentImageIndex]}
                alt={product.name}
                className="main-image"
              />
              {product.gallery.length > 1 && (
                <>
                  <button className="gallery-arrow prev" onClick={prevImage}>
                    &#8249;
                  </button>
                  <button className="gallery-arrow next" onClick={nextImage}>
                    &#8250;
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="product-details">
          <div className="product-brand">{product.brand}</div>
          <h1 className="product-name">{product.name}</h1>
          
          {/* Product Attributes */}
          {product.attributes.map((attr) => (
            <div 
              key={attr.id} 
              className="product-attribute"
              data-testid={`product-attribute-${kebabCase(attr.name)}`}
            >
              <h3 className="attribute-name">{attr.name}:</h3>
              <div className="attribute-options">
                {attr.items.map((option) => {
                  const isSelected = selectedAttributes[attr.id] === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleAttributeSelect(attr.id, option.value)}
                      className={`
                        attribute-option
                        ${attr.type === 'swatch' ? 'swatch' : ''}
                        ${isSelected ? 'selected' : ''}
                      `}
                      style={attr.type === 'swatch' ? { backgroundColor: option.value } : {}}
                      aria-label={`Select ${attr.name} ${option.display_value}`}
                    >
                      {attr.type !== 'swatch' && attr.name.toLowerCase() === 'size' 
                        ? getSizeInitials(option.display_value) 
                        : attr.type !== 'swatch' && option.display_value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Product Price */}
          <div className="product-price">
            <span className="price-label">Price:</span>
            <span className="price-amount">
              {price.currency_symbol}{price.amount.toFixed(2)}
            </span>
          </div>

          {/* Add to Cart Button */}
          <button
            className={`add-to-cart-btn ${isAddToCartDisabled() ? 'disabled' : ''}`}
            onClick={handleAddToCart}
            disabled={isAddToCartDisabled()}
            data-testid="add-to-cart"
          >
            {!product.in_stock ? 'OUT OF STOCK' : 'ADD TO CART'}
          </button>

          {/* Product Description */}
          <div className="product-description" data-testid="product-description">
            <div className="description-content">
              {parseDescription(product.description || '').split('\n').map((paragraph, index) => (
                paragraph.trim() && <p key={index}>{paragraph.trim()}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;