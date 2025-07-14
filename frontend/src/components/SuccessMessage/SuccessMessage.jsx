import React from 'react';
import './SuccessMessage.css';

const SuccessMessage = ({ messages = [], removeMessage }) => {
  if (!messages.length) return null;

  return (
    <div className="success-message-container">
      {messages.map(({ id, text, type }) => (
        <div
          key={id}
          className={`success-message ${type}`}
          onAnimationEnd={() => removeMessage(id)}
        >
          {text}
        </div>
      ))}
    </div>
  );
};

export default SuccessMessage;
