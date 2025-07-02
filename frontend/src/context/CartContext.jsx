import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product, selectedAttributes) => {
    setCartItems((prevItems) => {
      const cartId = `${product.id}-${Object.values(selectedAttributes).sort().join('-')}`;
      const existingItem = prevItems.find((item) => item.cartId === cartId);

      if (existingItem) {
        return prevItems.map((item) =>
          item.cartId === cartId ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, { ...product, selectedAttributes, quantity: 1, cartId }];
      }
    });
  };

  const value = {
    cartItems,
    setCartItems,
    isCartOpen,
    setIsCartOpen,
    addToCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};