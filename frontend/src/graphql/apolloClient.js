import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const httpLink = new HttpLink({
  // This should point to your local PHP server's GraphQL endpoint
  uri: 'http://localhost/Ecommerce-Shop/backend/public/', 
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;