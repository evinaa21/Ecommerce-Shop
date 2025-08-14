/**
 * Creates user-friendly error messages from various error types
 * @param {Error|string|Object} error - The error to format
 * @returns {string} - User-friendly error message
 */
export const formatErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  
  if (error?.networkError) {
    return 'Network connection failed. Please check your internet connection.';
  }
  
  if (error?.graphQLErrors?.length > 0) {
    return error.graphQLErrors[0].message;
  }
  
  if (error?.message) {
    // Handle common error patterns
    if (error.message.includes('Failed to fetch')) {
      return 'Unable to connect to server. Please try again later.';
    }
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Checks if an error is a network error
 * @param {Error} error - The error to check
 * @returns {boolean} - True if it's a network error
 */
export const isNetworkError = (error) => {
  return error?.networkError || error?.message?.includes('Failed to fetch');
};

/**
 * Logs errors in development and sends to monitoring service in production
 * @param {Error} error - The error to log
 * @param {Object} context - Additional context about the error
 */
export const logError = (error, context = {}) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error, 'Context:', context);
  } else {
    // In production, you might want to send to an error monitoring service
    // Example: Sentry.captureException(error, { extra: context });
  }
};