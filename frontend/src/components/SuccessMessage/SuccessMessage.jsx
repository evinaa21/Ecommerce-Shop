import React from 'react';
import './SuccessMessage.css';

const SuccessMessage = ({ message, isError }) => {
  if (!message) return null;

  return (
    <div className="success-message-container">
      <div className={`success-message ${isError ? 'error' : 'success'}`}>
        {message}
      </div>
    </div>
  );
};

export default SuccessMessage;
