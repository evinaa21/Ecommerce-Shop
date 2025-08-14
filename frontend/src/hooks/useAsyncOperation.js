import { useState } from 'react';
import { formatErrorMessage, logError } from '../utils/errorUtils';

/**
 * Custom hook for managing async operations with loading and error states
 * @returns {Object} - Async operation management functions and state
 */
export const useAsyncOperation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (asyncFunction, context = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction();
      setLoading(false);
      return { success: true, data: result };
    } catch (err) {
      const errorMessage = formatErrorMessage(err);
      setError(errorMessage);
      setLoading(false);
      logError(err, context);
      return { success: false, error: errorMessage };
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
  };

  return {
    loading,
    error,
    execute,
    reset
  };
};