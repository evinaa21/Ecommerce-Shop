import { lazy } from 'react';


export const LazyProductPage = lazy(() => 
  import('../pages/ProductPage/ProductPage')
);

export const LazyCategoryPage = lazy(() => 
  import('../pages/CategoryPage/CategoryPage')
);

export const LazyCartOverlay = lazy(() => 
  import('../components/CartOverlay/CartOverlay')
);


export const preloadComponent = (componentImport) => {
  const componentImporter = componentImport();
  return componentImporter;
};