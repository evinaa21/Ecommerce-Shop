import React from 'react';
import './SuccessMessage.css';

const SuccessMessage = ({ message }) => {
  if (!message) return null;

  return (
    <div className="success-message-container">
      <div className="success-message">
        {message}
      </div>
    </div>
  );
};

export default SuccessMessage;
