import { mockProducts } from '../models/mockData';

const MEDUSA_API = 'http://localhost:9000/store';
const PUBLISHABLE_API_KEY = 'pk_d686a27bd027f5ca488190c17cd54313f3366b2d5b7d2f8e416d2225bd136483';

export const ProductService = {
  getProducts: async () => {
    try {
      const res = await fetch(`${MEDUSA_API}/products?fields=*variants,*variants.prices`, {
        headers: {
          'x-publishable-api-key': PUBLISHABLE_API_KEY
        }
      });
      const data = await res.json();
      
      // Map Medusa product to frontend format
      return data.products.map((p: any) => {
        // Tìm giá tiền (vnd) của variant đầu tiên
        let price = 0;
        if (p.variants && p.variants.length > 0) {
          const vndPrice = p.variants[0].prices?.find((pr: any) => pr.currency_code === 'vnd');
          if (vndPrice) price = vndPrice.amount;
          else if (p.variants[0].prices?.length > 0) price = p.variants[0].prices[0].amount;
        }

        return {
          id: p.id,
          name: p.title,
          price: price,
          image: p.thumbnail || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
          category: 'smartphone' // hardcode tạm thời hoặc lấy từ category
        };
      });
    } catch (error) {
      console.error('Error fetching products from Medusa:', error);
      return [];
    }
  },
  
  getProductById: async (id: string) => {
    try {
      const res = await fetch(`${MEDUSA_API}/products/${id}?fields=*variants,*variants.prices`, {
        headers: {
          'x-publishable-api-key': PUBLISHABLE_API_KEY
        }
      });
      const data = await res.json();
      const p = data.product;
      
      let price = 0;
      if (p.variants && p.variants.length > 0) {
        const vndPrice = p.variants[0].prices?.find((pr: any) => pr.currency_code === 'vnd');
        if (vndPrice) price = vndPrice.amount;
        else if (p.variants[0].prices?.length > 0) price = p.variants[0].prices[0].amount;
      }

      return {
        id: p.id,
        name: p.title,
        price: price,
        image: p.thumbnail || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
        description: p.description,
        category: 'smartphone'
      };
    } catch (error) {
      console.error('Error fetching product from Medusa:', error);
      return null;
    }
  }
};
