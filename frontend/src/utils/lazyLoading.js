import { lazy } from 'react';

// Lazy load heavy components
export const LazyProductPage = lazy(() => 
  import('../pages/ProductPage/ProductPage')
);

export const LazyCategoryPage = lazy(() => 
  import('../pages/CategoryPage/CategoryPage')
);

export const LazyCartOverlay = lazy(() => 
  import('../components/CartOverlay/CartOverlay')
);

// Preload components on user interaction
export const preloadComponent = (componentImport) => {
  const componentImporter = componentImport();
  return componentImporter;
};