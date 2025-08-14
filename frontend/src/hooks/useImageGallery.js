import { useState } from 'react';

/**
 * Custom hook for managing image gallery state
 * @param {Array} images - Array of image URLs
 * @returns {Object} - Gallery management functions and state
 */
export const useImageGallery = (images = []) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const goToImage = (index) => {
    if (index >= 0 && index < images.length) {
      setCurrentIndex(index);
    }
  };

  return {
    currentIndex,
    currentImage: images[currentIndex],
    nextImage,
    prevImage,
    goToImage,
    hasMultipleImages: images.length > 1
  };
};