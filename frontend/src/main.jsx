import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { CartProvider } from './context/CartContext';
import App from './App.jsx';
import './index.css';

const client = new ApolloClient({
  uri: 'https://ecommerce-test.great-site.net/backend/public/', // Correct path to public/index.php
  cache: new InMemoryCache(),
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <BrowserRouter>
        <CartProvider>
          <App />
        </CartProvider>
      </BrowserRouter>
    </ApolloProvider>
  </StrictMode>
);
