/**
 * Safely sanitizes HTML content for rendering product descriptions
 * @param {string} html - The HTML string to sanitize
 * @returns {string} - Sanitized HTML string
 */
export const sanitizeHtml = (html) => {
  if (!html || typeof html !== 'string') return '';

  // Create a temporary DOM element to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Define allowed tags and their allowed attributes
  const allowedTags = {
    'p': [],
    'br': [],
    'strong': [],
    'b': [],
    'em': [],
    'i': [],
    'u': [],
    'span': ['style'],
    'div': [],
    'h1': [],
    'h2': [],
    'h3': [],
    'h4': [],
    'h5': [],
    'h6': [],
    'ul': [],
    'ol': [],
    'li': [],
    'a': ['href', 'target', 'rel'],
    'img': ['src', 'alt', 'title'],
    'blockquote': [],
    'code': [],
    'pre': []
  };

  // Define allowed CSS properties for style attributes
  const allowedStyles = [
    'color',
    'background-color',
    'font-size',
    'font-weight',
    'font-style',
    'text-align',
    'text-decoration',
    'margin',
    'padding',
    'border',
    'display'
  ];

  const sanitizeElement = (element) => {
    const tagName = element.tagName.toLowerCase();
    
    // Remove disallowed tags
    if (!allowedTags[tagName]) {
      // Keep the text content but remove the tag
      const textNode = document.createTextNode(element.textContent || '');
      element.parentNode?.replaceChild(textNode, element);
      return;
    }

    // Remove disallowed attributes
    const allowedAttrs = allowedTags[tagName];
    const attrs = Array.from(element.attributes);
    
    attrs.forEach(attr => {
      if (!allowedAttrs.includes(attr.name)) {
        element.removeAttribute(attr.name);
      }
    });

    // Sanitize style attribute if present
    if (element.hasAttribute('style') && allowedAttrs.includes('style')) {
      const style = element.getAttribute('style');
      const sanitizedStyle = sanitizeStyle(style);
      if (sanitizedStyle) {
        element.setAttribute('style', sanitizedStyle);
      } else {
        element.removeAttribute('style');
      }
    }

    // Sanitize href attributes to prevent XSS
    if (element.hasAttribute('href')) {
      const href = element.getAttribute('href');
      if (!isValidUrl(href)) {
        element.removeAttribute('href');
      } else {
        // Add security attributes for external links
        if (href.startsWith('http')) {
          element.setAttribute('target', '_blank');
          element.setAttribute('rel', 'noopener noreferrer');
        }
      }
    }

    // Recursively sanitize child elements
    Array.from(element.children).forEach(child => {
      sanitizeElement(child);
    });
  };

  const sanitizeStyle = (styleString) => {
    if (!styleString) return '';
    
    const styles = styleString.split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .filter(s => {
        const [property] = s.split(':').map(p => p.trim());
        return allowedStyles.includes(property);
      })
      .filter(s => {
        // Basic validation to prevent CSS injection
        return !s.includes('expression') && 
               !s.includes('javascript:') && 
               !s.includes('data:') &&
               !s.includes('url(');
      });

    return styles.join('; ');
  };

  const isValidUrl = (url) => {
    if (!url) return false;
    
    // Allow relative URLs
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
      return true;
    }
    
    // Allow specific protocols
    const allowedProtocols = ['http:', 'https:', 'mailto:'];
    try {
      const urlObj = new URL(url);
      return allowedProtocols.includes(urlObj.protocol);
    } catch {
      return false;
    }
  };

  // Start sanitization from the root
  Array.from(temp.children).forEach(child => {
    sanitizeElement(child);
  });

  return temp.innerHTML;
};

/**
 * Converts HTML to plain text while preserving line breaks
 * @param {string} html - The HTML string to convert
 * @returns {string} - Plain text with line breaks
 */
export const htmlToText = (html) => {
  if (!html || typeof html !== 'string') return '';
  
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
};

/**
 * Truncates HTML content to a specified length while preserving tags
 * @param {string} html - The HTML string to truncate
 * @param {number} maxLength - Maximum length of text content
 * @returns {string} - Truncated HTML
 */
export const truncateHtml = (html, maxLength = 150) => {
  if (!html) return '';
  
  const textContent = htmlToText(html);
  if (textContent.length <= maxLength) return html;
  
  const temp = document.createElement('div');
  temp.innerHTML = sanitizeHtml(html);
  
  let currentLength = 0;
  const truncateNode = (node) => {
    if (currentLength >= maxLength) {
      node.remove();
      return;
    }
    
    if (node.nodeType === Node.TEXT_NODE) {
      const remainingLength = maxLength - currentLength;
      if (node.textContent.length > remainingLength) {
        node.textContent = node.textContent.substring(0, remainingLength) + '...';
        currentLength = maxLength;
      } else {
        currentLength += node.textContent.length;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      Array.from(node.childNodes).forEach(child => {
        truncateNode(child);
      });
    }
  };
  
  Array.from(temp.childNodes).forEach(child => {
    truncateNode(child);
  });
  
  return temp.innerHTML;
};

/**
 * Checks if a string contains HTML tags
 * @param {string} str - The string to check
 * @returns {boolean} - True if string contains HTML tags
 */
export const containsHtml = (str) => {
  if (!str || typeof str !== 'string') return false;
  return /<[^>]*>/g.test(str);
};

/**
 * Formats product description based on content type
 * @param {string} description - The description to format
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted description
 */
export const formatProductDescription = (description, options = {}) => {
  const {
    maxLength = null,
    allowHtml = true,
    fallbackText = 'No description available'
  } = options;
  
  if (!description || description.trim() === '') {
    return fallbackText;
  }
  
  if (!allowHtml || !containsHtml(description)) {
    const text = htmlToText(description);
    return maxLength ? text.substring(0, maxLength) + (text.length > maxLength ? '...' : '') : text;
  }
  
  const sanitized = sanitizeHtml(description);
  return maxLength ? truncateHtml(sanitized, maxLength) : sanitized;
};