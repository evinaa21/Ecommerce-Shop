import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useMutation } from '@apollo/client';
import { PLACE_ORDER } from '../../graphql/mutations';
import CartItem from '../CartItem/CartItem.jsx';
import CartHeader from '../CartHeader/CartHeader';
import CartSummary from '../CartSummary/CartSummary';
import SuccessMessage from '../SuccessMessage/SuccessMessage';
import { calculateTotalPrice, calculateTotalItems } from '../../utils/priceUtils';
import { formatAttributesForOrder } from '../../utils/cartUtils';
import './CartOverlay.css';

const CartOverlay = () => {
  const { cartItems, isCartOpen, setIsCartOpen, clearCart, successMessage, showSuccessMessage } = useCart();
  const [placeOrder, { loading }] = useMutation(PLACE_ORDER);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isCartOpen) {
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

  const totalItems = calculateTotalItems(cartItems);
  const totalPrice = calculateTotalPrice(cartItems);

  const handlePlaceOrder = async () => {
    const products = cartItems.map(item => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.prices[0].amount,
      attributes: formatAttributesForOrder(item.selectedAttributes, item.attributes)
    }));

    try {
      const { data } = await placeOrder({
        variables: {
          products: products,
          total: parseFloat(totalPrice.toFixed(2))
        }
      });

      if (data.createOrder.success) {
        showSuccessMessage(data.createOrder.message);
        clearCart();
        setIsCartOpen(false);
      } else {
        showSuccessMessage(`Error: ${data.createOrder.message}`);
      }
    } catch (e) {
      console.error('Error placing order:', e);
      showSuccessMessage(`Error placing order: ${e.message}`);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsCartOpen(false);
    }
  };

  return (
    <>
      <div
        className={`cart-overlay-backdrop ${isClosing ? 'closing' : ''}`}
        data-testid="cart-overlay"
        onClick={handleBackdropClick}
      >
        <div
          className={`cart-overlay-container ${isClosing ? 'closing' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <CartHeader totalItems={totalItems} />
          
          <div className="cart-item-list">
            {cartItems.map((item) => (
              <CartItem key={item.cartId} item={item} />
            ))}
          </div>
          
          <CartSummary
            totalItems={totalItems}
            totalPrice={totalPrice}
            currencySymbol={cartItems[0]?.prices[0]?.currency_symbol || '$'}
            onPlaceOrder={handlePlaceOrder}
            loading={loading}
            disabled={cartItems.length === 0}
          />
        </div>
      </div>

      <SuccessMessage message={successMessage} />
    </>
  );
};

export default CartOverlay;
