import { useState, useEffect } from 'react';
import { ProductService } from '../services/product.service';

export const useProductController = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const data = await ProductService.getProducts();
      setProducts(data as any[]);
      setLoading(false);
    };

    fetchProducts();
  }, []);

  return {
    products,
    loading
  };
};
