import React from 'react';
import './SuccessMessage.css';

const SuccessMessage = ({ message, isError }) => {
  if (!message) return null;

  return (
    <div className={`message-container ${isError ? 'error' : 'success'}`}>
      {message}
    </div>
  );
};

export default SuccessMessage;
