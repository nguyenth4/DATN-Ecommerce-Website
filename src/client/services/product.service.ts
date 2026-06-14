import { mockProducts } from '../models/mockData';

export const ProductService = {
  getProducts: async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockProducts);
      }, 500);
    });
  },
  
  getProductById: async (id: string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockProducts.find(p => p.id === id));
      }, 500);
    });
  }
};
