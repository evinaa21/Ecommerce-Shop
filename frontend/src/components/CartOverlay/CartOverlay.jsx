import React from 'react';
import { useCart } from '../../context/CartContext';
import { useMutation } from '@apollo/client';
import { PLACE_ORDER } from '../../graphql/mutations';
import CartItem from '../CartItem/CartItem.jsx'; // Update the import path
import './CartOverlay.css';

const CartOverlay = () => {
  const { cartItems, isCartOpen, setIsCartOpen, clearCart } = useCart();
  const [placeOrder, { loading, error }] = useMutation(PLACE_ORDER);

  if (!isCartOpen) return null;

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => {
    const price = item.prices[0].amount; // Assuming first currency
    return sum + price * item.quantity;
  }, 0);

  const handlePlaceOrder = async () => {
    const products = cartItems.map(item => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.prices[0].amount,
      attributes: Object.entries(item.selectedAttributes).map(([name, value]) => ({
        name: name,
        value: value
      }))
    }));

    try {
      await placeOrder({ 
        variables: { 
          products: products,
          total: parseFloat(totalPrice.toFixed(2))
        } 
      });
      alert('Order placed successfully!');
      clearCart();
      setIsCartOpen(false);
    } catch (e) {
      console.error('Error placing order:', e);
      alert(`Error placing order: ${e.message}`);
    }
  };

  return (
    <div className="cart-overlay-backdrop" onClick={() => setIsCartOpen(false)}>
      <div className="cart-overlay-container" onClick={(e) => e.stopPropagation()}>
        <div className="cart-overlay-header">
          <strong>My Bag,</strong> {totalItems} {totalItems === 1 ? 'item' : 'items'}
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