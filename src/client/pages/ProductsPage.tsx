import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useProducts, useCategories } from '../services/product.service';
import ProductCard from '../components/ProductCard';
import Sidebar from '../components/Sidebar';
import Pagination from '../components/Pagination';

const PRODUCTS_PER_PAGE = 12;

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL State
  const categoryId = searchParams.get('category') || null;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const q = searchParams.get('q') || '';
  const order = searchParams.get('order') || '';
  const minPrice = parseInt(searchParams.get('minPrice') || '0', 10);
  const maxPrice = parseInt(searchParams.get('maxPrice') || '0', 10);

  // Derived state for API
  const offset = (page - 1) * PRODUCTS_PER_PAGE;
  
  // Fetch Data
  const { data: categories } = useCategories();
  const { data, isLoading } = useProducts({
    limit: PRODUCTS_PER_PAGE,
    offset,
    category_id: categoryId ? [categoryId] : undefined,
    q: q || undefined,
    order: order || undefined,
  });

  const products = useMemo(() => {
    let result = data?.products?.map((p: any) => {
      const price = p.variants?.[0]?.prices?.[0]?.amount || 0;
      return {
        id: p.id,
        name: p.title,
        image: p.thumbnail,
        price: price,
        category: p.categories?.[0]?.name || 'Sản phẩm'
      };
    }) || [];

    // Client-side price filter (since Medusa API v2 price filtering can be complex)
    if (minPrice > 0) result = result.filter(p => p.price >= minPrice);
    if (maxPrice > 0) result = result.filter(p => p.price <= maxPrice);

    return result;
  }, [data, minPrice, maxPrice]);

  const totalPages = Math.ceil((data?.count || 0) / PRODUCTS_PER_PAGE);

  // Handlers
  const updateParams = (newParams: Record<string, string | null>) => {
    const current = Object.fromEntries(searchParams.entries());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '' || value === '0') {
        delete current[key];
      } else {
        current[key] = value;
      }
    });
    setSearchParams(current);
  };

  return (
    <>
      <div className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <span>Sản phẩm</span>
          </div>
          <h1>TẤT CẢ SẢN PHẨM</h1>
        </div>
      </div>

      <section className="section products-section-bg">
        <div className="container">
          <div className="products-layout">
            
            <Sidebar 
              categories={categories || []}
              selectedCategory={categoryId}
              onSelectCategory={(id) => updateParams({ category: id, page: '1' })}
              priceRange={{ min: minPrice, max: maxPrice }}
              onPriceChange={(min, max) => updateParams({ minPrice: min.toString(), maxPrice: max.toString(), page: '1' })}
              onClearFilters={() => setSearchParams({})}
            />

            <div>
              <div className="products-header">
                <span className="products-count">{data?.count || 0} sản phẩm</span>
                <div className="flex-center" style={{ gap: '0.8rem' }}>
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm..." 
                    className="form-control"
                    style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                    value={q}
                    onChange={(e) => updateParams({ q: e.target.value, page: '1' })}
                  />
                  <select 
                    className="sort-select"
                    value={order}
                    onChange={(e) => updateParams({ order: e.target.value, page: '1' })}
                  >
                    <option value="">Nổi bật nhất</option>
                    <option value="price_asc">Giá: Thấp đến cao</option>
                    <option value="price_desc">Giá: Cao đến thấp</option>
                    <option value="-created_at">Mới nhất</option>
                  </select>
                </div>
              </div>

              {isLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải sản phẩm...</div>
              ) : products.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Không tìm thấy sản phẩm nào phù hợp.</div>
              ) : (
                <div className="products-grid">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

              <Pagination 
                currentPage={page} 
                totalPages={totalPages} 
                onPageChange={(p) => updateParams({ page: p.toString() })} 
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductsPage;
