import { useProducts } from '../services/product.service';

export const useProductController = () => {
  // We can fetch a default list of featured products
  const { data, isLoading } = useProducts({ limit: 4 });

  // Map the Medusa product shape to match the previous mock shape if needed, 
  // or return raw products. The previous shape had 'image', 'name', 'price'.
  const products = data?.products?.map((p: any) => {
    // get price from variants
    const price = p.variants?.[0]?.prices?.[0]?.amount || 0;
    
    return {
      id: p.id,
      name: p.title,
      image: p.thumbnail,
      price: price,
      category: p.categories?.[0]?.name || 'Sản phẩm'
    };
  }) || [];

  return {
    products,
    loading: isLoading
  };
};
