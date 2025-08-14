/**
 * Validation rules for different field types
 */
export const validationRules = {
  required: (value) => ({
    isValid: value !== null && value !== undefined && value !== '',
    error: 'This field is required'
  }),
  
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      isValid: emailRegex.test(value),
      error: 'Please enter a valid email address'
    };
  },
  
  minLength: (minLength) => (value) => ({
    isValid: value && value.length >= minLength,
    error: `Must be at least ${minLength} characters long`
  }),
  
  maxLength: (maxLength) => (value) => ({
    isValid: !value || value.length <= maxLength,
    error: `Must be no more than ${maxLength} characters long`
  }),
  
  phone: (value) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return {
      isValid: !value || phoneRegex.test(value),
      error: 'Please enter a valid phone number'
    };
  },
  
  attributeSelected: (value) => ({
    isValid: value !== null && value !== undefined && value !== '',
    error: 'Please select an option'
  })
};

/**
 * Validates a single field against multiple rules
 * @param {any} value - The value to validate
 * @param {Array} rules - Array of validation rules
 * @returns {Object} - Validation result
 */
export const validateField = (value, rules = []) => {
  for (const rule of rules) {
    const result = rule(value);
    if (!result.isValid) {
      return result;
    }
  }
  return { isValid: true, error: null };
};

/**
 * Validates an entire form object
 * @param {Object} formData - The form data to validate
 * @param {Object} validationSchema - Schema defining validation rules for each field
 * @returns {Object} - Validation results for all fields
 */
export const validateForm = (formData, validationSchema) => {
  const errors = {};
  let isValid = true;
  
  Object.keys(validationSchema).forEach(fieldName => {
    const fieldValue = formData[fieldName];
    const fieldRules = validationSchema[fieldName];
    const fieldResult = validateField(fieldValue, fieldRules);
    
    if (!fieldResult.isValid) {
      errors[fieldName] = fieldResult.error;
      isValid = false;
    }
  });
  
  return { isValid, errors };
};