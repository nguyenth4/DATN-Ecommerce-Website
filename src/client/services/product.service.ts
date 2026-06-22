import { useQuery } from '@tanstack/react-query';
import { medusa } from '../../shared/lib/medusa';

export interface ProductQueryParams {
  limit?: number;
  offset?: number;
  category_id?: string[];
  id?: string | string[];
  q?: string;
  order?: string;
}

// Fallback Mock data for development when Medusa backend is offline
const MOCK_STORE_PRODUCTS = [
  {
    id: "1",
    title: "Galaxy Note 20 Ultra 5G",
    thumbnail: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80",
    variants: [{ prices: [{ amount: 27800000 }] }],
    categories: [{ name: "Smartphones" }],
    metadata: {
      specifications: {
        "Màn hình": "6.9 inch, Dynamic AMOLED 2X, 120Hz",
        "Hệ điều hành": "Android 10",
        "Camera sau": "Chính 108MP & Phụ 12MP, 12MP",
        "Camera trước": "10MP",
        "Chipset": "Exynos 990",
        "RAM": "12 GB",
        "Bộ nhớ trong": "256 GB",
        "Dung lượng pin": "4500 mAh",
        "Sạc": "Sạc nhanh 25W",
        "Công nghệ pin": "Li-Ion"
      }
    }
  },
  {
    id: "2",
    title: "iPad 10th Generation",
    thumbnail: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=500&q=80",
    variants: [{ prices: [{ amount: 17800000 }] }],
    categories: [{ name: "Laptops & Desktops" }],
    metadata: {
      specifications: {
        "Màn hình": "10.9 inch, Liquid Retina IPS LCD",
        "Hệ điều hành": "iPadOS 16",
        "Camera sau": "Chính 12MP",
        "Camera trước": "12MP",
        "Chipset": "Apple A14 Bionic (5nm)",
        "RAM": "4 GB",
        "Bộ nhớ trong": "64 GB",
        "Dung lượng pin": "7606 mAh",
        "Sạc": "Sạc nhanh 20W",
        "Công nghệ pin": "Li-Po"
      }
    }
  },
  {
    id: "3",
    title: "Apple MacBook Pro M3",
    thumbnail: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80",
    variants: [{ prices: [{ amount: 24800000 }] }],
    categories: [{ name: "Laptops & Desktops" }],
    metadata: {
      specifications: {
        "Màn hình": "14.2 inch, Liquid Retina XDR",
        "Hệ điều hành": "macOS Sonoma",
        "Camera sau": "Không có",
        "Camera trước": "FaceTime HD 1080p",
        "Chipset": "Apple M3",
        "RAM": "8 GB",
        "Bộ nhớ trong": "512 GB",
        "Dung lượng pin": "70 Wh",
        "Sạc": "Sạc nhanh 70W MagSafe 3",
        "Công nghệ pin": "Li-Po"
      }
    }
  },
  {
    id: "4",
    title: "Canon EOS R7 DSLR",
    thumbnail: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&q=80",
    variants: [{ prices: [{ amount: 19200000 }] }],
    categories: [{ name: "Cameras" }],
    metadata: {
      specifications: {
        "Màn hình": "3.0 inch, LCD xoay lật 1.62 triệu điểm",
        "Hệ điều hành": "Canon OS",
        "Camera sau": "Cảm biến APS-C CMOS 32.5MP",
        "Camera trước": "Không có",
        "Chipset": "DIGIC X",
        "RAM": "N/A",
        "Bộ nhớ trong": "Không có bộ nhớ trong",
        "Dung lượng pin": "LP-E6NH (~500 tấm)",
        "Sạc": "Sạc qua USB-C",
        "Công nghệ pin": "Li-Ion"
      }
    }
  },
  {
    id: "5",
    title: "Apple Watch Series 9",
    thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
    variants: [{ prices: [{ amount: 6800000 }] }],
    categories: [{ name: "Smart Watches" }],
    metadata: {
      specifications: {
        "Màn hình": "OLED Retina Always-on, 2000 nits",
        "Hệ điều hành": "watchOS 10",
        "Camera sau": "Không có",
        "Camera trước": "Không có",
        "Chipset": "Apple S9 SiP",
        "RAM": "2 GB",
        "Bộ nhớ trong": "64 GB",
        "Dung lượng pin": "Dùng 18 tiếng liên tục",
        "Sạc": "Sạc nhanh không dây",
        "Công nghệ pin": "Li-Ion"
      }
    }
  },
  {
    id: "6",
    title: "Beats Studio Buds Pro",
    thumbnail: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500&q=80",
    variants: [{ prices: [{ amount: 280000 }] }],
    categories: [{ name: "Headphones & Buds" }],
    metadata: {
      specifications: {
        "Màn hình": "Không có",
        "Hệ điều hành": "iOS / Android tương thích",
        "Camera sau": "Không có",
        "Camera trước": "Không có",
        "Chipset": "Beats Proprietary",
        "RAM": "N/A",
        "Bộ nhớ trong": "N/A",
        "Dung lượng pin": "8 tiếng tai nghe",
        "Sạc": "Sạc qua USB-C",
        "Công nghệ pin": "Li-Ion"
      }
    }
  },
  {
    id: "7",
    title: "Apple HomePod 2nd Gen",
    thumbnail: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80",
    variants: [{ prices: [{ amount: 280000 }] }],
    categories: [{ name: "Accessories" }],
    metadata: {
      specifications: {
        "Màn hình": "Không có",
        "Hệ điều hành": "HomePod OS",
        "Camera sau": "Không có",
        "Camera trước": "Không có",
        "Chipset": "Apple S7",
        "RAM": "N/A",
        "Bộ nhớ trong": "N/A",
        "Dung lượng pin": "Cắm điện trực tiếp",
        "Sạc": "Cắm nguồn 220V",
        "Công nghệ pin": "Không có"
      }
    }
  },
  {
    id: "8",
    title: "Power Wired Controller",
    thumbnail: "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=500&q=80",
    variants: [{ prices: [{ amount: 190000 }] }],
    categories: [{ name: "Gaming" }],
    metadata: {
      specifications: {
        "Màn hình": "Không có",
        "Hệ điều hành": "Xbox / Windows tương thích",
        "Camera sau": "Không có",
        "Camera trước": "Không có",
        "Chipset": "N/A",
        "RAM": "N/A",
        "Bộ nhớ trong": "N/A",
        "Dung lượng pin": "Nguồn USB",
        "Sạc": "Nguồn từ cổng USB",
        "Công nghệ pin": "Không có"
      }
    }
  },
  {
    id: "9",
    title: "Galaxy S24 Ultra Mint",
    thumbnail: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500&q=80",
    variants: [{ prices: [{ amount: 1420000 }] }],
    categories: [{ name: "Smartphones" }],
    metadata: {
      specifications: {
        "Màn hình": "6.8 inch, Dynamic AMOLED 2X, QHD+, 120Hz",
        "Hệ điều hành": "Android 14",
        "Camera sau": "Chính 200MP & Phụ 50MP, 12MP, 10MP",
        "Camera trước": "12MP",
        "Chipset": "Snapdragon 8 Gen 3 (4nm)",
        "RAM": "12 GB",
        "Bộ nhớ trong": "256 GB",
        "Dung lượng pin": "5000 mAh",
        "Sạc": "Sạc nhanh 45W",
        "Công nghệ pin": "Li-Ion"
      }
    }
  }
];

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
      console.warn('Medusa API connection failed, using fallback mock products.', error);
      
      let filtered = [...MOCK_STORE_PRODUCTS];
      
      // Filter by ID or list of IDs
      if (params && params.id) {
        const ids = Array.isArray(params.id) ? params.id : [params.id];
        filtered = filtered.filter(p => ids.includes(p.id));
      }
      
      // Filter by query 'q'
      if (params?.q) {
        const q = params.q.toLowerCase();
        filtered = filtered.filter(p => p.title.toLowerCase().includes(q));
      }
      
      const limit = params?.limit || 10;
      const offset = params?.offset || 0;
      const products = filtered.slice(offset, offset + limit);
      
      return {
        products,
        count: filtered.length,
        offset,
        limit
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
      console.warn(`Medusa API connection failed for product ${id}, using fallback.`, error);
      const product = MOCK_STORE_PRODUCTS.find(p => p.id === id);
      if (product) return product;
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
