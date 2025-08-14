import React from 'react';
import { useImageGallery } from '../../hooks/useImageGallery';
import './ProductGallery.css';

const ProductGallery = ({ gallery, productName }) => {
  const { 
    currentIndex, 
    currentImage, 
    nextImage, 
    prevImage, 
    goToImage, 
    hasMultipleImages 
  } = useImageGallery(gallery);

  return (
    <div className="product-gallery" data-testid="product-gallery">
      <div className="gallery-thumbnails">
        {gallery.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`${productName} ${index + 1}`}
            className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToImage(index)}
          />
        ))}
      </div>
      <div className="gallery-main">
        <div className="main-image-container">
          <img
            src={currentImage}
            alt={productName}
            className="main-image"
          />
          {hasMultipleImages && (
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
  );
};

export default ProductGallery;