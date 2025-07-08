import { gql } from '@apollo/client';

export const PLACE_ORDER = gql`
  mutation PlaceOrder($products: [OrderInput!]!, $total: Float!) {
    placeOrder(products: $products, total: $total) {
      success
      message
    }
  }
`;