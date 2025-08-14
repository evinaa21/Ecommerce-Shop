import React from 'react';
import './ProductAttributes.css';

const ProductAttributes = ({ attributes, selectedAttributes, onAttributeSelect }) => {
  const kebabCase = (str) => str ? str.replace(/\s+/g, '-').toLowerCase() : '';

  const getSizeInitials = (value) => {
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

  return (
    <div className="product-attributes">
      {attributes.map((attr) => (
        <div 
          key={attr.id} 
          className="product-attribute"
          data-testid={`product-attribute-${kebabCase(attr.name)}`}
        >
          <h3 className="attribute-name">{attr.name}:</h3>
          <div className="attribute-options">
            {attr.items.map((option) => {
              const isSelected = selectedAttributes[attr.id] === option.value;
              const testId = `product-attribute-${kebabCase(attr.name)}-${option.value}`;
              return (
                <button
                  key={option.value}
                  data-testid={testId}
                  onClick={() => onAttributeSelect(attr.id, option.value)}
                  className={`
                    attribute-option
                    ${attr.type === 'swatch' ? 'swatch' : ''}
                    ${isSelected ? 'selected' : ''}
                  `}
                  style={attr.type === 'swatch' ? { backgroundColor: option.value } : {}}
                  aria-label={`Select ${attr.name} ${option.display_value}`}
                >
                  {attr.type !== 'swatch' && attr.name.toLowerCase() === 'size' 
                    ? getSizeInitials(option.display_value) 
                    : attr.type !== 'swatch' && option.display_value}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductAttributes;