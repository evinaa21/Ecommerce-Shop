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

// Enhanced error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(`GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`);
    });
  }

  if (networkError) {
    console.error(`Network error:`, networkError);
    console.error(`Status: ${networkError.statusCode}`);
    console.error(`Message: ${networkError.message}`);
    
    // Log additional details for 500 errors
    if (networkError.statusCode === 500) {
      console.warn('Server error detected - this may be a cold start or database connection issue');
    }
  }
});

// Enhanced retry link with more aggressive retry for initial loads
const retryLink = new RetryLink({
  delay: {
    initial: 1000,
    max: 8000, // Increased max delay
    jitter: true
  },
  attempts: {
    max: 5, // Increased retry attempts
    retryIf: (error, operation) => {
      const is500Error = error?.networkError?.statusCode === 500;
      const isNetworkError = !!error?.networkError;
      const isConnectionError = error?.message?.includes('Failed to fetch') ||
                               error?.message?.includes('Network request failed');
      
      // Retry on server errors, network issues, or connection problems
      const shouldRetry = is500Error || isConnectionError || 
                         (isNetworkError && !error?.networkError?.statusCode);
      
      if (shouldRetry) {
        console.log(`Retrying ${operation.operationName} (attempt ${operation.getContext().retryCount || 1})`);
      }
      
      return shouldRetry;
    }
  }
});

// HTTP link with increased timeout and better error handling
const httpLink = createHttpLink({
  uri: 'https://ecommerce-shop-production-3d0b.up.railway.app/',
  fetchOptions: {
    timeout: 15000, // Increased timeout for cold starts
  },
  // Add custom fetch to handle network errors better
  fetch: async (uri, options) => {
    try {
      const response = await fetch(uri, options);
      
      // Log response details for debugging
      if (!response.ok) {
        console.error(`HTTP ${response.status}: ${response.statusText}`);
        if (response.status === 500) {
          console.error('Server error - possible cold start or database issue');
        }
      }
      
      return response;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }
});

const client = new ApolloClient({
  link: from([errorLink, retryLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          categories: {
            merge: false,
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
      fetchPolicy: 'network-only', // Changed for initial load reliability
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
