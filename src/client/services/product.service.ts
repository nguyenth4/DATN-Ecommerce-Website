import { useQuery } from '@tanstack/react-query';
import { medusa } from '../../shared/lib/medusa';

export interface ProductQueryParams {
  id?: string | string[];
  limit?: number;
  offset?: number;
  category_id?: string[];
  q?: string;
  order?: string;
}

export const productService = {
  // Fetch all products with optional filters
  async getProducts(params?: ProductQueryParams) {
    try {
      const { products, count, offset, limit } = await medusa.store.product.list({
        fields: '*variants,*variants.prices,*categories,*metadata,*images', // fetch relational data
        ...params,
      });
      return { products, count, offset, limit };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Fetch product categories
  async getCategories() {
    try {
      const { product_categories } = await medusa.store.category.list({
        fields: '*category_children',
      });
      return product_categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Fetch single product
  async getProduct(id: string) {
    try {
      const { product } = await medusa.store.product.retrieve(id, {
        fields: '*variants,*variants.prices,*categories,*options,*metadata,*images',
      });
      return product;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }
};

// --- REACT QUERY HOOKS ---

export const useProducts = (params?: ProductQueryParams) => {
  return useQuery({
    queryKey: ['store_products', params],
    queryFn: () => productService.getProducts(params),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['store_categories'],
    queryFn: () => productService.getCategories(),
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['store_product', id],
    queryFn: () => productService.getProduct(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};
