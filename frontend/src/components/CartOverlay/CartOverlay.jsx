import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useMutation } from '@apollo/client';
import { PLACE_ORDER } from '../../graphql/mutations';
import CartItem from '../CartItem/CartItem.jsx';
import './CartOverlay.css';

const CartOverlay = () => {
  const { cartItems, isCartOpen, setIsCartOpen, clearCart } = useCart();
  const [placeOrder, { loading, error }] = useMutation(PLACE_ORDER);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isCartOpen) {
      // Opening cart
      setIsVisible(true);
      setIsClosing(false);
    } else {
      if (isVisible) {
        setIsClosing(true);
        const timer = setTimeout(() => {
          setIsVisible(false);
          setIsClosing(false);
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [isCartOpen, isVisible]); 

  if (!isVisible) return null;

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => {
    const price = item.prices[0].amount;
    return sum + price * item.quantity;
  }, 0);

  const handlePlaceOrder = async () => {
    const products = cartItems.map(item => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.prices[0].amount,
      attributes: Object.entries(item.selectedAttributes).map(([attributeId, value]) => {
        const attribute = item.attributes.find(attr => attr.id === attributeId);
        return {
          name: attribute ? attribute.name : attributeId,
          value: value
        };
      })
    }));

    try {
      const { data } = await placeOrder({ 
        variables: { 
          products: products,
          total: parseFloat(totalPrice.toFixed(2))
        } 
      });
      
      if (data.createOrder.success) {
        alert(data.createOrder.message);
        clearCart();
        setIsCartOpen(false);
      } else {
        alert(`Error: ${data.createOrder.message}`);
      }
    } catch (e) {
      console.error('Error placing order:', e);
      alert(`Error placing order: ${e.message}`);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsCartOpen(false);
    }
  };

  return (
    <div 
      className={`cart-overlay-backdrop ${isClosing ? 'closing' : ''}`}
      data-testid="cart-overlay"
      onClick={handleBackdropClick}
    >
      <div 
        className={`cart-overlay-container ${isClosing ? 'closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cart-overlay-header">
          <strong>My Bag,</strong> {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
        </div>
        <div className="cart-item-list">
          {cartItems.map((item) => (
            <CartItem key={item.cartId} item={item} />
          ))}
        </div>
        <div className="cart-overlay-footer">
          <div className="cart-total" data-testid="cart-total">
            <span>Total</span>
            <span>{cartItems[0]?.prices[0]?.currency_symbol}{totalPrice.toFixed(2)}</span>
          </div>
          <div className="cart-actions">
            <button
              className="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={cartItems.length === 0 || loading}
            >
              {loading ? 'PLACING ORDER...' : 'PLACE ORDER'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartOverlay;