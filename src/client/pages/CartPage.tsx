import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Minus, 
  X, 
  ArrowLeft,
  Zap,
  RotateCcw,
  Star,
  Ticket
} from 'lucide-react';
import { getCart, updateCartQty, removeFromCart } from '../utils/cart';
import type { CartItem } from '../utils/cart';

const PROMO_DISCOUNT = 56000;

const CartPage = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [stockInfo, setStockInfo] = useState<Record<string, number>>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    setItems(getCart());
  }, []);

  // Validate stock when cart items change
  useEffect(() => {
    setValidationErrors([]);
    let isMounted = true;
    
    const fetchStock = async () => {
      try {
        const { productService } = await import('../services/product.service');
        const stockMap: Record<string, number> = {};
        
        const productIds = Array.from(new Set(items.map(item => item.productId)));
        const products = await Promise.all(
          productIds.map(pid => productService.getProduct(pid).catch(() => null))
        );
        
        items.forEach(item => {
          const product = products.find((p: any) => p?.id === item.productId);
          const variant = product?.variants?.find((v: any) => v.id === item.id);
          
          if (variant) {
            stockMap[item.id] = (variant.inventory_quantity !== undefined && variant.inventory_quantity !== null) 
              ? variant.inventory_quantity 
              : ((variant.stock !== undefined && variant.stock !== null) ? variant.stock : 10);
          } else {
            stockMap[item.id] = 10;
          }
        });
        
        if (isMounted) {
          setStockInfo(stockMap);
        }
      } catch (err) {
        console.error("Failed to fetch stock", err);
      }
    };

    if (items.length > 0) {
      fetchStock();
    } else {
      setStockInfo({});
    }
    
    return () => { isMounted = false; };
  }, [items]);
  const [promoApplied, setPromoApplied] = useState(false);

  const shippingFee = 0;

  const updateQty = (id: string, delta: number) => {
    const updated = items.map(item => {
      if (item.id === id) {
        const maxStock = stockInfo[id] ?? item.stock ?? 10;
        const newQty = Math.min(maxStock, Math.max(1, item.qty + delta));
        updateCartQty(id, newQty);
        return { ...item, qty: newQty };
      }
      return item;
    });
    setItems(updated);
  };

  const removeItem = (id: string) => {
    removeFromCart(id);
    setItems(items.filter(item => item.id !== id));
  };

  const applyPromo = () => {
    setPromoApplied(true);
  };

  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount = promoApplied ? PROMO_DISCOUNT : 0;
  const total = subtotal + shippingFee - discount;


  return (
    <>
      <main id="main">

        <section className="page-head">
          <div className="container">
            <div className="crumbs"><Link to="/">Trang chủ</Link> <span className="sep">/</span> <span>Giỏ hàng</span></div>
            <h1>Giỏ hàng của bạn</h1>
            <p>{itemCount} {itemCount === 1 ? 'sản phẩm' : 'sản phẩm'} · sẵn sàng giao. Miễn phí vận chuyển cho đơn hàng này. Dự kiến giao hàng 21 – 23 Tháng 5.</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="cart-layout">

              <div>
                {validationErrors.length > 0 && (
                  <div className="validation-warnings" style={{
                    marginBottom: 'var(--s5)',
                    padding: 'var(--s4)',
                    background: '#fef2f2',
                    borderLeft: '4px solid var(--rose)',
                    borderRadius: 'var(--r)',
                    color: '#991b1b',
                    fontSize: '0.9rem'
                  }}>
                    <h4 style={{ fontWeight: 700, marginBottom: 'var(--s2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.1rem' }}>⚠️</span> Cảnh báo tồn kho:
                    </h4>
                    <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                      {validationErrors.map((err, idx) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>{err}</li>
                      ))}
                    </ul>
                    <p style={{ marginTop: 'var(--s3)', fontSize: '0.8rem', color: '#7f1d1d' }}>
                      Vui lòng điều chỉnh số lượng hoặc xóa sản phẩm bị lỗi để tiến hành thanh toán.
                    </p>
                  </div>
                )}

                {items.length > 0 ? (
                  <div className="cart-list">
                    {items.map((item) => {
                      const actualStock = stockInfo[item.id];
                      const isOutOfStock = actualStock === 0;
                      const isInsufficient = actualStock !== undefined && actualStock < item.qty;
                      const imgUrl = item.img.startsWith('http') ? item.img : `https://images.unsplash.com/${item.img}?w=200&q=80&auto=format&fit=crop`;

                      return (
                        <article className="cart-row" key={item.id} style={{ opacity: isOutOfStock ? 0.6 : 1 }}>
                          <div className="pic">
                            <img src={imgUrl} alt={item.name} />
                          </div>
                          <div className="info">
                            <div className="name">{item.name}</div>
                            <div className="variant">{item.variant}</div>
                            {actualStock !== undefined && !item.id.startsWith('mock-') && (
                              <div style={{ fontSize: '12px', marginTop: '4px', fontWeight: 600, color: isOutOfStock ? '#dc2626' : (isInsufficient ? '#d97706' : '#16a34a') }}>
                                {isOutOfStock ? 'Hết hàng' : (isInsufficient ? `Chỉ còn ${actualStock} sản phẩm` : `Còn hàng (${actualStock} sản phẩm)`)}
                              </div>
                            )}
                          </div>
                          <div className="qty">
                            <button aria-label="Decrease" onClick={() => updateQty(item.id, -1)}><Minus size={16} /></button>
                            <input type="text" value={item.qty} inputMode="numeric" aria-label="Quantity" readOnly />
                            <button 
                              aria-label="Increase" 
                              onClick={() => updateQty(item.id, 1)}
                              disabled={actualStock !== undefined && item.qty >= actualStock}
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          <span className="subtotal">{(item.price * item.qty).toLocaleString('vi-VN')}đ</span>
                          <button className="remove" aria-label="Remove" onClick={() => removeItem(item.id)}><X size={18} /></button>

                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <p>Giỏ hàng của bạn đang trống. <Link to="/products">Tiếp tục mua sắm →</Link></p>
                )}

                <div style={{ marginTop: 'var(--s5)', display: 'flex', gap: 'var(--s3)', flexWrap: 'wrap' }}>
                  <Link to="/products" className="btn btn--ghost"><ArrowLeft size={16} style={{marginRight: '8px'}}/> Tiếp tục mua sắm</Link>
                  <button className="btn btn--ghost" onClick={() => setItems(getCart())}>Cập nhật giỏ hàng</button>
                </div>

                {/* Trust strip */}
                <div style={{ marginTop: 'var(--s7)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s4)', padding: 'var(--s5)', background: 'var(--bg)', borderRadius: 'var(--r)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--indigo-soft)', color: 'var(--indigo)', borderRadius: '999px', display: 'grid', placeItems: 'center' }}>
                      <Zap size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>Giao hàng nhanh miễn phí</div>
                      <div style={{ fontSize: '11px', color: 'var(--fg-mute)' }}>2 — 3 ngày làm việc</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--indigo-soft)', color: 'var(--indigo)', borderRadius: '999px', display: 'grid', placeItems: 'center' }}>
                      <RotateCcw size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>30 ngày đổi trả miễn phí</div>
                      <div style={{ fontSize: '11px', color: 'var(--fg-mute)' }}>Không cần lý do</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--indigo-soft)', color: 'var(--indigo)', borderRadius: '999px', display: 'grid', placeItems: 'center' }}>
                      <Star size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>Bảo hành 2 năm</div>
                      <div style={{ fontSize: '11px', color: 'var(--fg-mute)' }}>Cho mọi đơn hàng Sprylo</div>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="cart-summary" style={{ background: '#fff', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', alignSelf: 'flex-start', position: 'sticky', top: '90px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '16px', color: '#111' }}>Thông tin đơn hàng</h3>

                {/* Promo Box */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8f9fa', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Ticket size={20} fill="#2563eb" color="#2563eb" style={{ transform: 'rotate(-45deg)' }} />
                    <span style={{ fontSize: '14px', color: '#333' }}>Áp dụng mã giảm giá</span>
                  </div>
                  <button onClick={applyPromo} style={{ background: '#eff6ff', color: '#2563eb', border: 'none', padding: '4px 16px', borderRadius: '16px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>Chọn</button>
                </div>

                {/* Summary Lines */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#444' }}>
                    <span>Số lượng sản phẩm</span>
                    <span style={{ fontWeight: 600, color: '#111' }}>{itemCount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#444' }}>
                    <span>Tổng tiền hàng</span>
                    <span style={{ fontWeight: 600, color: '#111' }}>{subtotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#444' }}>
                    <span>Phí vận chuyển</span>
                    <span style={{ fontWeight: 600, color: '#111' }}>{shippingFee > 0 ? `${shippingFee.toLocaleString('vi-VN')}đ` : 'Miễn phí'}</span>
                  </div>
                  {promoApplied && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#444' }}>
                      <span>Khuyến mãi</span>
                      <span style={{ fontWeight: 600, color: '#2563eb' }}>−{discount.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                </div>

                <div style={{ height: '1px', background: '#eaeaea', margin: '20px 0' }}></div>

                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#111', textTransform: 'uppercase' }}>TỔNG TIỀN</div>
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>(Đã bao gồm VAT và được làm tròn)</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '18px', color: '#2563eb' }}>{total.toLocaleString('vi-VN')}đ</div>
                </div>

                {/* Action */}
                {validationErrors.length > 0 ? (
                  <button 
                    style={{ width: '100%', background: '#ef4444', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 600, cursor: 'not-allowed', opacity: 0.8 }} 
                    disabled
                  >
                    Vui lòng sửa lỗi tồn kho
                  </button>
                ) : (
                  <Link to="/checkout" style={{ display: 'block', textDecoration: 'none' }}>
                    <button style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', textAlign: 'center' }}>
                      <div style={{ fontSize: '15px', fontWeight: 600, textTransform: 'uppercase' }}>MUA NGAY ({itemCount})</div>
                      <div style={{ fontSize: '12px', fontWeight: 400, marginTop: '2px' }}>Giao nhanh từ 2 giờ hoặc nhận tại cửa hàng</div>
                    </button>
                  </Link>
                )}
              </aside>

            </div>
          </div>
        </section>

      </main>
    </>
  );
};

export default CartPage;