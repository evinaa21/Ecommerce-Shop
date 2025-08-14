import { toKebabCase } from './stringUtils';

/**
 * Generates test ID for product attributes
 * @param {string} attributeName - The attribute name
 * @param {string} value - The attribute value (optional)
 * @returns {string} - The test ID
 */
export const getAttributeTestId = (attributeName, value = null) => {
  const baseId = `product-attribute-${toKebabCase(attributeName)}`;
  return value ? `${baseId}-${value}` : baseId;
};

/**
 * Generates test ID for cart item attributes
 * @param {string} attributeName - The attribute name
 * @param {string} value - The attribute value
 * @param {boolean} isSelected - Whether the attribute is selected
 * @returns {string} - The test ID
 */
export const getCartAttributeTestId = (attributeName, value, isSelected = false) => {
  const baseId = `cart-item-attribute-${toKebabCase(attributeName)}-${toKebabCase(value)}`;
  return isSelected ? `${baseId}-selected` : baseId;
};

/**
 * Generates test ID for product cards
 * @param {string} productName - The product name
 * @returns {string} - The test ID
 */
export const getProductTestId = (productName) => {
  return `product-${toKebabCase(productName)}`;
};