import React from 'react';
import './CartHeader.css';

const CartHeader = ({ totalItems }) => {
  return (
    <div className="cart-header">
      <strong>My Bag,</strong> {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
    </div>
  );
};

export default CartHeader;