
import { useState, useEffect } from 'react';
import { areAllAttributesSelected } from '../utils/cartUtils';

/**
 * Custom hook for managing product attribute selection
 * @param {Array} attributes - Product attributes array
 * @returns {Object} - Attribute management functions and state
 */
export const useProductAttributes = (attributes) => {
  const [selectedAttributes, setSelectedAttributes] = useState({});

  useEffect(() => {
    if (attributes) {
      const initialAttributes = {};
      attributes.forEach((attr) => {
        initialAttributes[attr.id] = '';
      });
      setSelectedAttributes(initialAttributes);
    }
  }, [attributes]);

  const selectAttribute = (attributeId, value) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [attributeId]: value
    }));
  };

  const clearAttributes = () => {
    const clearedAttributes = {};
    attributes?.forEach((attr) => {
      clearedAttributes[attr.id] = '';
    });
    setSelectedAttributes(clearedAttributes);
  };

  const isComplete = areAllAttributesSelected(attributes || [], selectedAttributes);

  return {
    selectedAttributes,
    selectAttribute,
    clearAttributes,
    isComplete
  };
};