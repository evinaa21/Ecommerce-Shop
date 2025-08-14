export const API_ENDPOINTS = {
  GRAPHQL: import.meta.env.VITE_API_URL || 'https://ecommerce-shop-production-3d0b.up.railway.app/',
};

export const LOCAL_STORAGE_KEYS = {
  CART_ITEMS: 'cartItems',
  USER_PREFERENCES: 'userPreferences',
  LAST_VISITED_CATEGORY: 'lastVisitedCategory',
};

export const MESSAGES = {
  SUCCESS: {
    ITEM_ADDED: 'Item added to cart successfully!',
    ORDER_PLACED: 'Order placed successfully!',
    ITEM_REMOVED: 'Item removed from cart',
  },
  ERROR: {
    NETWORK: 'Network connection failed',
    SERVER: 'Server error occurred',
    NOT_FOUND: 'Item not found',
    OUT_OF_STOCK: 'This item is currently out of stock',
  },
  LOADING: {
    PRODUCTS: 'Loading products...',
    CATEGORIES: 'Loading categories...',
    PLACING_ORDER: 'Placing order...',
  }
};

export const BREAKPOINTS = {
  MOBILE_SMALL: '480px',
  MOBILE: '768px',
  TABLET: '1024px',
  DESKTOP: '1200px',
  DESKTOP_LARGE: '1440px',
};

export const CART_LIMITS = {
  MAX_QUANTITY_PER_ITEM: 10,
  MAX_ITEMS_IN_CART: 50,
};

export const CURRENCY = {
  DEFAULT_SYMBOL: '$',
  DEFAULT_LOCALE: 'en-US',
};