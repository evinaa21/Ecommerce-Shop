import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';
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

  // Debug logging
  const debugLog = useCallback((action, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[CartContext] ${action}:`, data);
    }
  }, []);

  // Memoize expensive calculations
  const cartStats = useMemo(() => getCartStatistics(cartItems), [cartItems]);
  const cartValidation = useMemo(() => validateCart(cartItems), [cartItems]);

  // Memoize message handlers
  const showSuccessMessage = useCallback((message) => {
    debugLog('Success Message', message);
    setSuccessMessage(message);
    setErrorMessage('');
    setTimeout(() => setSuccessMessage(''), 3000);
  }, [debugLog]);

  const showErrorMessage = useCallback((message) => {
    debugLog('Error Message', message);
    setErrorMessage(message);
    setSuccessMessage('');
    setTimeout(() => setErrorMessage(''), 5000);
  }, [debugLog]);

  // Memoize cart operations
  const addToCart = useCallback((product, selectedAttributes) => {
    debugLog('Add to Cart Attempt', { product: product.name, selectedAttributes });
    
    try {
      if (!product.in_stock) {
        showErrorMessage(MESSAGES?.ERROR?.OUT_OF_STOCK || 'Item is out of stock');
        return false;
      }

      const cartId = generateCartId(product.id, selectedAttributes);
      debugLog('Generated Cart ID', cartId);
      
      setCartItems((prevItems) => {
        debugLog('Previous Cart Items', prevItems);
        
        const existingItem = prevItems.find((item) => item.cartId === cartId);
        const newQuantity = existingItem ? existingItem.quantity + 1 : 1;
        
        debugLog('Existing Item', existingItem);
        debugLog('New Quantity', newQuantity);
        
        if (newQuantity > (CART_LIMITS?.MAX_QUANTITY_PER_ITEM || 10)) {
          showErrorMessage(`Maximum ${CART_LIMITS?.MAX_QUANTITY_PER_ITEM || 10} items allowed per product`);
          return prevItems;
        }

        if (!existingItem && prevItems.length >= (CART_LIMITS?.MAX_ITEMS_IN_CART || 50)) {
          showErrorMessage(`Maximum ${CART_LIMITS?.MAX_ITEMS_IN_CART || 50} different items allowed in cart`);
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

        let updatedItems;
        if (existingItem) {
          updatedItems = prevItems.map((item) =>
            item.cartId === cartId ? { ...item, quantity: newQuantity } : item
          );
        } else {
          updatedItems = [...prevItems, { ...productToAdd, selectedAttributes, quantity: 1, cartId }];
        }
        
        debugLog('Updated Cart Items', updatedItems);
        return updatedItems;
      });

      showSuccessMessage(MESSAGES?.SUCCESS?.ITEM_ADDED || 'Item added successfully');
      return true;
    } catch (error) {
      debugLog('Add to Cart Error', error);
      showErrorMessage('Failed to add item to cart');
      return false;
    }
  }, [setCartItems, showSuccessMessage, showErrorMessage, debugLog]);

  const updateQuantity = useCallback((cartId, amount) => {
    debugLog('Update Quantity', { cartId, amount });
    
    setCartItems((prevItems) => {
      const updatedItems = prevItems
        .map((item) => {
          if (item.cartId === cartId) {
            const newQuantity = item.quantity + amount;
            if (newQuantity > (CART_LIMITS?.MAX_QUANTITY_PER_ITEM || 10)) {
              showErrorMessage(`Maximum ${CART_LIMITS?.MAX_QUANTITY_PER_ITEM || 10} items allowed`);
              return item;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
        
      debugLog('Updated Items after Quantity Change', updatedItems);
      return updatedItems;
    });
  }, [setCartItems, showErrorMessage, debugLog]);

  const removeItem = useCallback((cartId) => {
    debugLog('Remove Item', cartId);
    
    setCartItems((prevItems) => {
      const updatedItems = prevItems.filter(item => item.cartId !== cartId);
      debugLog('Updated Items after Removal', updatedItems);
      return updatedItems;
    });
    showSuccessMessage(MESSAGES?.SUCCESS?.ITEM_REMOVED || 'Item removed from cart');
  }, [setCartItems, showSuccessMessage, debugLog]);

  const clearCart = useCallback(() => {
    debugLog('Clear Cart', 'All items removed');
    setCartItems([]);
  }, [setCartItems, debugLog]);

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