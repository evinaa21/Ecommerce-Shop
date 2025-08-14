import { calculateTotalItems, calculateTotalPrice } from './priceUtils'; // Add this import

/**
 * Generates a unique cart ID for a product with selected attributes
 * @param {string} productId - The product ID
 * @param {Object} selectedAttributes - The selected attributes object
 * @returns {string} - The unique cart ID
 */
export const generateCartId = (productId, selectedAttributes) => {
  const attributeString = Object.values(selectedAttributes).sort().join('-');
  return `${productId}-${attributeString}`;
};

/**
 * Creates default attributes for a product (selects first option for each attribute)
 * @param {Array} attributes - Array of product attributes
 * @returns {Object} - Object with default attribute selections
 */
export const createDefaultAttributes = (attributes) => {
  return attributes.reduce((acc, attr) => {
    if (attr.items && attr.items.length > 0) {
      acc[attr.id] = attr.items[0].value;
    }
    return acc;
  }, {});
};

/**
 * Checks if all required attributes are selected
 * @param {Array} productAttributes - Array of product attributes
 * @param {Object} selectedAttributes - Object of selected attributes
 * @returns {boolean} - True if all attributes are selected
 */
export const areAllAttributesSelected = (productAttributes, selectedAttributes) => {
  return productAttributes.every(attr => selectedAttributes[attr.id]);
};

/**
 * Formats attributes for order submission
 * @param {Object} selectedAttributes - Selected attributes object
 * @param {Array} productAttributes - Product attributes array
 * @returns {Array} - Formatted attributes array
 */
export const formatAttributesForOrder = (selectedAttributes, productAttributes) => {
  return Object.entries(selectedAttributes).map(([attributeId, value]) => {
    const attribute = productAttributes.find(attr => attr.id === attributeId);
    return {
      name: attribute ? attribute.name : attributeId,
      value: value
    };
  });
};

/**
 * Calculates cart statistics
 * @param {Array} cartItems - Array of cart items
 * @returns {Object} - Cart statistics
 */
export const getCartStatistics = (cartItems) => {
  const totalItems = calculateTotalItems(cartItems);
  const totalPrice = calculateTotalPrice(cartItems);
  const uniqueProducts = cartItems.length;
  const averageItemPrice = totalItems > 0 ? totalPrice / totalItems : 0;
  
  return {
    totalItems,
    totalPrice,
    uniqueProducts,
    averageItemPrice
  };
};

/**
 * Finds items in cart that are similar to a given product
 * @param {Array} cartItems - Array of cart items
 * @param {Object} product - Product to find similar items for
 * @returns {Array} - Array of similar cart items
 */
export const findSimilarCartItems = (cartItems, product) => {
  return cartItems.filter(item => 
    item.brand === product.brand || 
    item.category === product.category
  );
};

/**
 * Validates cart before checkout
 * @param {Array} cartItems - Array of cart items
 * @returns {Object} - Validation result
 */
export const validateCart = (cartItems) => {
  const errors = [];
  
  if (cartItems.length === 0) {
    errors.push('Cart is empty');
  }
  
  const outOfStockItems = cartItems.filter(item => !item.in_stock);
  if (outOfStockItems.length > 0) {
    errors.push(`Some items are out of stock: ${outOfStockItems.map(item => item.name).join(', ')}`);
  }
  
  const incompleteItems = cartItems.filter(item => 
    !areAllAttributesSelected(item.attributes, item.selectedAttributes)
  );
  if (incompleteItems.length > 0) {
    errors.push(`Some items have incomplete attribute selections: ${incompleteItems.map(item => item.name).join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Estimates shipping based on cart total
 * @param {number} totalPrice - Total cart price
 * @returns {Object} - Shipping information
 */
export const calculateShipping = (totalPrice) => {
  if (totalPrice >= 100) {
    return { cost: 0, description: 'Free shipping' };
  } else if (totalPrice >= 50) {
    return { cost: 5.99, description: 'Standard shipping' };
  } else {
    return { cost: 9.99, description: 'Standard shipping' };
  }
};