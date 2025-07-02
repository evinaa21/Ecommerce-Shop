import { gql } from '@apollo/client';

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
        id
        name
        in_stock
        gallery
        prices {
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
    }
  }
`;