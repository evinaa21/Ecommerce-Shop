import React, { createContext, useState, useContext, useEffect } from 'react';
import { generateCartId, validateCart, getCartStatistics } from '../utils/cartUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { MESSAGES, LOCAL_STORAGE_KEYS, CART_LIMITS } from '../constants';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useLocalStorage(LOCAL_STORAGE_KEYS.CART_ITEMS, []);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentCategory, setCurrentCategory] = useState('all');

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setErrorMessage(''); // Clear any error messages
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const showErrorMessage = (message) => {
    setErrorMessage(message);
    setSuccessMessage(''); // Clear any success messages
    setTimeout(() => setErrorMessage(''), 5000);
  };

  const addToCart = (product, selectedAttributes) => {
    try {
      // Validate stock
      if (!product.in_stock) {
        showErrorMessage(MESSAGES.ERROR.OUT_OF_STOCK);
        return false;
      }

      const cartId = generateCartId(product.id, selectedAttributes);
      const existingItem = cartItems.find((item) => item.cartId === cartId);

      // Check quantity limits
      const newQuantity = existingItem ? existingItem.quantity + 1 : 1;
      if (newQuantity > CART_LIMITS.MAX_QUANTITY_PER_ITEM) {
        showErrorMessage(`Maximum ${CART_LIMITS.MAX_QUANTITY_PER_ITEM} items allowed per product`);
        return false;
      }

      // Check total items limit
      if (!existingItem && cartItems.length >= CART_LIMITS.MAX_ITEMS_IN_CART) {
        showErrorMessage(`Maximum ${CART_LIMITS.MAX_ITEMS_IN_CART} different items allowed in cart`);
        return false;
      }

      const productToAdd = {
        id: product.id,
        name: product.name,
        brand: product.brand,
        gallery: product.gallery,
        prices: product.prices,
        attributes: product.attributes,
        in_stock: product.in_stock,
      };

      setCartItems((prevItems) => {
        if (existingItem) {
          return prevItems.map((item) =>
            item.cartId === cartId ? { ...item, quantity: newQuantity } : item
          );
        } else {
          return [...prevItems, { ...productToAdd, selectedAttributes, quantity: 1, cartId }];
        }
      });

      showSuccessMessage(MESSAGES.SUCCESS.ITEM_ADDED);
      return true;
    } catch (error) {
      showErrorMessage('Failed to add item to cart');
      return false;
    }
  };

  const updateQuantity = (cartId, amount) => {
    setCartItems((prevItems) => {
      return prevItems
        .map((item) => {
          if (item.cartId === cartId) {
            const newQuantity = item.quantity + amount;
            if (newQuantity > CART_LIMITS.MAX_QUANTITY_PER_ITEM) {
              showErrorMessage(`Maximum ${CART_LIMITS.MAX_QUANTITY_PER_ITEM} items allowed`);
              return item;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const removeItem = (cartId) => {
    setCartItems((prevItems) => prevItems.filter(item => item.cartId !== cartId));
    showSuccessMessage(MESSAGES.SUCCESS.ITEM_REMOVED);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartValidation = () => validateCart(cartItems);
  const getCartStats = () => getCartStatistics(cartItems);

  const value = {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    successMessage,
    errorMessage,
    currentCategory,
    setCurrentCategory,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    showSuccessMessage,
    showErrorMessage,
    getCartValidation,
    getCartStats,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};