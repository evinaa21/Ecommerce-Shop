import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const localData = localStorage.getItem('cartItems');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentCategory, setCurrentCategory] = useState('all');

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000); 
  };

  const addToCart = (product, selectedAttributes) => {
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
      const cartId = `${productToAdd.id}-${Object.values(selectedAttributes).sort().join('-')}`;
      const existingItem = prevItems.find((item) => item.cartId === cartId);

      if (existingItem) {
        return prevItems.map((item) =>
          item.cartId === cartId ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, { ...productToAdd, selectedAttributes, quantity: 1, cartId }];
      }
    });
    showSuccessMessage('Item added successfully');
  };

  const updateQuantity = (cartId, amount) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems
        .map((item) => {
          if (item.cartId === cartId) {
            return { ...item, quantity: item.quantity + amount };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);       return updatedItems;
    });
  };

  const updateAttributes = (cartId, newAttributes) => {
    setCartItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.cartId === cartId) {
          return { 
            ...item, 
            selectedAttributes: { ...item.selectedAttributes, ...newAttributes } 
          };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const value = {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    successMessage,
    currentCategory,
    setCurrentCategory,
    addToCart,
    updateQuantity,
    updateAttributes, 
    clearCart,
    showSuccessMessage, // <-- Add this line!
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};