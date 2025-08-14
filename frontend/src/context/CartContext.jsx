import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { generateCartId, validateCart, getCartStatistics } from '../utils/cartUtils';
import { calculateTotalItems } from '../utils/priceUtils'; // Add this import
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

  // Memoize expensive calculations
  const cartStats = useMemo(() => getCartStatistics(cartItems), [cartItems]);
  const cartValidation = useMemo(() => validateCart(cartItems), [cartItems]);

  // Memoize message handlers
  const showSuccessMessage = useCallback((message) => {
    setSuccessMessage(message);
    setErrorMessage('');
    setTimeout(() => setSuccessMessage(''), 3000);
  }, []);

  const showErrorMessage = useCallback((message) => {
    setErrorMessage(message);
    setSuccessMessage('');
    setTimeout(() => setErrorMessage(''), 5000);
  }, []);

  // Memoize cart operations
  const addToCart = useCallback((product, selectedAttributes) => {
    try {
      if (!product.in_stock) {
        showErrorMessage(MESSAGES.ERROR.OUT_OF_STOCK);
        return false;
      }

      const cartId = generateCartId(product.id, selectedAttributes);
      
      setCartItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.cartId === cartId);
        const newQuantity = existingItem ? existingItem.quantity + 1 : 1;
        
        if (newQuantity > CART_LIMITS.MAX_QUANTITY_PER_ITEM) {
          showErrorMessage(`Maximum ${CART_LIMITS.MAX_QUANTITY_PER_ITEM} items allowed per product`);
          return prevItems;
        }

        if (!existingItem && prevItems.length >= CART_LIMITS.MAX_ITEMS_IN_CART) {
          showErrorMessage(`Maximum ${CART_LIMITS.MAX_ITEMS_IN_CART} different items allowed in cart`);
          return prevItems;
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
  }, [showSuccessMessage, showErrorMessage]);

  const updateQuantity = useCallback((cartId, amount) => {
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
  }, [showErrorMessage]);

  const removeItem = useCallback((cartId) => {
    setCartItems((prevItems) => prevItems.filter(item => item.cartId !== cartId));
    showSuccessMessage(MESSAGES.SUCCESS.ITEM_REMOVED);
  }, [showSuccessMessage]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, [setCartItems]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
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
    cartStats,
    cartValidation,
  }), [
    cartItems,
    isCartOpen,
    successMessage,
    errorMessage,
    currentCategory,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    showSuccessMessage,
    showErrorMessage,
    cartStats,
    cartValidation,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};