import React, { useState } from 'react';
import './ProductGallery.css';

const ProductGallery = ({ gallery, productName }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === gallery.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? gallery.length - 1 : prev - 1
    );
  };

  return (
    <div className="product-gallery" data-testid="product-gallery">
      <div className="gallery-thumbnails">
        {gallery.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`${productName} ${index + 1}`}
            className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
            onClick={() => setCurrentImageIndex(index)}
          />
        ))}
      </div>
      <div className="gallery-main">
        <div className="main-image-container">
          <img
            src={gallery[currentImageIndex]}
            alt={productName}
            className="main-image"
          />
          {gallery.length > 1 && (
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