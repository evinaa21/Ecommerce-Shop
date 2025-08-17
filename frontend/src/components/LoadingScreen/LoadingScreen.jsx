import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = ({ message = "Loading...", subMessage = null }) => {
  return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <p className="loading-message">{message}</p>
      {subMessage && <p className="loading-submessage">{subMessage}</p>}
    </div>
  );
};

export default LoadingScreen;