import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { createHttpLink } from '@apollo/client/link/http';
import { CartProvider } from './context/CartContext';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import App from './App.jsx';
import './index.css';

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(`GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`);
    });
  }

  if (networkError) {
    console.error(`Network error: ${networkError}`);
    
    // Handle specific network errors
    if (networkError.statusCode === 500) {
      console.warn('Server error detected, may retry...');
    }
  }
});

// Retry link for failed requests
const retryLink = new RetryLink({
  delay: {
    initial: 1000, // Start with 1 second delay
    max: 5000, // Max 5 seconds
    jitter: true
  },
  attempts: {
    max: 3,
    retryIf: (error, _operation) => {
      // Retry on network errors and 5xx server errors
      return !!error && (
        error.networkError?.statusCode >= 500 ||
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('Internal server error')
      );
    }
  }
});

// HTTP link with timeout
const httpLink = createHttpLink({
  uri: 'https://ecommerce-shop-production-3d0b.up.railway.app/',
  fetchOptions: {
    timeout: 10000, // 10 second timeout
  }
});

const client = new ApolloClient({
  link: from([errorLink, retryLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          categories: {
            merge: false, // Don't merge, replace array
          },
        },
      },
      Product: {
        fields: {
          gallery: {
            merge: false,
          },
          attributes: {
            merge: false,
          },
        },
      },
      Category: {
        fields: {
          products: {
            merge: false,
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'cache-first',
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
    },
  },
});

// Handle chunk loading errors globally
window.addEventListener('error', (event) => {
  if (event.message?.includes('Loading chunk')) {
    console.warn('Chunk loading error detected, reloading page...');
    window.location.reload(true);
  }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('Loading chunk')) {
    console.warn('Chunk loading promise rejection, reloading page...');
    window.location.reload(true);
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ApolloProvider client={client}>
        <BrowserRouter>
          <CartProvider>
            <App />
          </CartProvider>
        </BrowserRouter>
      </ApolloProvider>
    </ErrorBoundary>
  </StrictMode>
);
