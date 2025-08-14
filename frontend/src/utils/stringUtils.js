/**
 * Converts a string to kebab-case format
 * @param {string} str - The string to convert
 * @returns {string} - The kebab-case string
 */
export const toKebabCase = (str) => {
  if (!str) return '';
  return str
    .replace(/\s+/g, '-')
    .replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
    .replace(/^-/, '') 
    .toLowerCase();
};

/**
 * Parses HTML description to plain text with line breaks
 * @param {string} html - The HTML string to parse
 * @returns {string} - The parsed text with line breaks
 */
export const parseDescription = (html) => {
  if (!html) return '';
  
  return html
    .replace(/<p>/g, '')
    .replace(/<\/p>/g, '\n')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]*>/g, '')
    .trim();
};

/**
 * Capitalizes the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} - The capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Gets size initials for display (used in size attributes)
 * @param {string} value - The size value
 * @returns {string} - The size initials or original value
 */
export const getSizeInitials = (value) => {
  if (!value) return '';
  
  
  if (!isNaN(value) || /^\d+/.test(value)) {
    return value; 
  }
  
  const words = value.split(' ');
  if (words.length > 1) {
    return words.map(word => {
      if (word.toLowerCase() === 'extra') return 'X';
      return word[0];
    }).join('').toUpperCase();
  }
  return value[0].toUpperCase();
};

/**
 * Truncates text to a specified length
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} - The truncated text with ellipsis if needed
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Removes HTML tags from a string
 * @param {string} html - The HTML string
 * @returns {string} - The plain text
 */
export const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};