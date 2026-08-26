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
  // NOTE: list views only ever render `thumbnail`, never the full `images` array,
  // so we skip `*images` here to shrink the payload significantly. The detail
  // page (getProduct below) still fetches `*images` for the product gallery.
  async getProducts(params?: ProductQueryParams) {
    try {
      const { products, count, offset, limit } = await medusa.store.product.list({
        // List view chỉ cần thumbnail (field mặc định) để hiển thị card,
        // không cần *images (mảng ảnh đầy đủ) — giảm payload đáng kể.
        // *images đầy đủ chỉ cần ở trang chi tiết (getProduct).
        fields: '*variants,*variants.prices,+variants.inventory_quantity,+variants.manage_inventory,*categories,+metadata',
        ...params,
      });
      return { products, count, offset, limit };
    } catch (error) {
      console.error('Medusa API connection failed:', error);
      return {
        products: [],
        count: 0,
        offset: params?.offset || 0,
        limit: params?.limit || 10
      };
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
      console.error('Lỗi khi tải danh mục sản phẩm:', error);
      throw error;
    }
  },

  // Fetch single product
  async getProduct(id: string) {
    try {
      const { product } = await medusa.store.product.retrieve(id, {
        fields: '*variants,*variants.prices,+variants.inventory_quantity,+variants.manage_inventory,*categories,*options,+metadata,*images',
      });
      return product;
    } catch (error) {
      console.error(`Lỗi khi tải thông tin sản phẩm ${id}:`, error);
      throw error;
    }
  },

  // ── Lấy min/max giá thực tế của products theo danh mục ──────────────────
  // Dùng limit lớn để lấy toàn bộ price data (không cần nội dung đầy đủ)
  async getPriceRange(categoryIds?: string[]): Promise<{ min: number; max: number }> {
    try {
      const { products } = await medusa.store.product.list({
        fields: '*variants,*variants.prices',
        limit: 500,
        ...(categoryIds && categoryIds.length > 0 ? { category_id: categoryIds } : {}),
      });

      const prices: number[] = [];
      for (const p of products) {
        for (const v of (p as any).variants ?? []) {
          for (const pr of v.prices ?? []) {
            const amount = Number(pr.amount);
            if (amount > 0) prices.push(amount);
          }
        }
      }

      if (prices.length === 0) return { min: 0, max: 50_000_000 };
      return {
        min: Math.floor(Math.min(...prices) / 1_000_000) * 1_000_000,
        max: Math.ceil(Math.max(...prices) / 1_000_000) * 1_000_000,
      };
    } catch {
      return { min: 0, max: 50_000_000 };
    }
  },

  // Track user interaction
  async trackInteraction(productId: string, interactionType: 'VIEW' | 'CART' | 'PURCHASE', sessionId?: string) {
    try {
      await medusa.client.fetch('/store/interactions', {
        method: 'POST',
        body: { product_id: productId, interaction_type: interactionType, session_id: sessionId },
      });
    } catch (error) {
      console.error('Failed to track interaction:', error);
    }
  },

  // Get recommended products
  async getRecommendedProducts(sessionId?: string) {
    try {
      const url = `/store/recommendations${sessionId ? `?session_id=${sessionId}` : ''}`;
      const data = await medusa.client.fetch<any>(url, { method: 'GET' });
      return data.products || [];
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      return [];
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

// ── Hook: lấy khoảng giá thực tế theo danh mục đã chọn ─────────────────────
// Re-fetches khi selectedCats thay đổi (cache theo key)
export const useProductPriceRange = (selectedCats: string[]) => {
  return useQuery({
    queryKey: ['product_price_range', selectedCats.slice().sort()],
    queryFn: () => productService.getPriceRange(selectedCats.length > 0 ? selectedCats : undefined),
    staleTime: 1000 * 60 * 5,
    placeholderData: { min: 0, max: 50_000_000 },
  });
};

export const useRecommendedProducts = (sessionId?: string) => {
  return useQuery({
    queryKey: ['recommended_products', sessionId],
    queryFn: () => productService.getRecommendedProducts(sessionId),
    staleTime: 1000 * 60 * 5,
  });
};

