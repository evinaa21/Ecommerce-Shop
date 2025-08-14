/**
 * Formats a price with currency symbol
 * @param {number} amount - The price amount
 * @param {string} currencySymbol - The currency symbol
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} - The formatted price string
 */
export const formatPrice = (amount, currencySymbol = '$', decimals = 2) => {
  if (typeof amount !== 'number') return `${currencySymbol}0.00`;
  return `${currencySymbol}${amount.toFixed(decimals)}`;
};

/**
 * Calculates total price for cart items
 * @param {Array} cartItems - Array of cart items
 * @returns {number} - The total price
 */
export const calculateTotalPrice = (cartItems) => {
  return cartItems.reduce((sum, item) => {
    const price = item.prices?.[0]?.amount || 0;
    return sum + (price * item.quantity);
  }, 0);
};

/**
 * Calculates total quantity for cart items
 * @param {Array} cartItems - Array of cart items
 * @returns {number} - The total quantity
 */
export const calculateTotalItems = (cartItems) => {
  return cartItems.reduce((sum, item) => sum + item.quantity, 0);
};

/**
 * Gets the first price from a product's prices array
 * @param {Array} prices - Array of price objects
 * @returns {Object|null} - The first price object or null
 */
export const getFirstPrice = (prices) => {
  return prices && prices.length > 0 ? prices[0] : null;
};