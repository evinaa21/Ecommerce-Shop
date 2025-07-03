import { gql } from '@apollo/client';

export const PLACE_ORDER = gql`
  mutation PlaceOrder($products: [ProductInput!]!, $total: Float!) {
    createOrder(products: $products, total: $total) {
      success
      message
    }
  }
`;