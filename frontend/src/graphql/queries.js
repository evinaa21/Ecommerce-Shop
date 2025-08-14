import { gql } from '@apollo/client';

// Fragment for reusable fields
const PRODUCT_FRAGMENT = gql`
  fragment ProductInfo on Product {
    id
    name
    brand
    in_stock
    gallery
    prices {
      currency_label
      currency_symbol
      amount
    }
    attributes {
      id
      name
      type
      items {
        display_value
        value
      }
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      name
    }
  }
`;

export const GET_PRODUCTS_BY_CATEGORY = gql`
  query GetProductsByCategory($title: String!) {
    category(title: $title) {
      name
      products {
        ...ProductInfo
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const GET_PRODUCT_BY_ID = gql`
  query GetProductById($id: String!) {
    product(id: $id) {
      ...ProductInfo
      description
      category
    }
  }
  ${PRODUCT_FRAGMENT}
`;