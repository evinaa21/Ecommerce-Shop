import React from 'react';
import { toKebabCase, getSizeInitials } from '../../utils/stringUtils';
import { getAttributeTestId } from '../../utils/testUtils';
import './ProductAttributes.css';

const ProductAttributes = ({ attributes, selectedAttributes, onAttributeSelect }) => {
  return (
    <div className="product-attributes">
      {attributes.map((attr) => (
        <div 
          key={attr.id} 
          className="product-attribute"
          data-testid={getAttributeTestId(attr.name)}
        >
          <h3 className="attribute-name">{attr.name}:</h3>
          <div className="attribute-options">
            {attr.items.map((option) => {
              const isSelected = selectedAttributes[attr.id] === option.value;
              const testId = getAttributeTestId(attr.name, option.value);
              
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