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

const MEDUSA_BACKEND_URL =
  (import.meta as any).env?.VITE_MEDUSA_BACKEND_URL || 'http://localhost:9000';

const PUBLISHABLE_KEY =
  (import.meta as any).env?.VITE_MEDUSA_PUBLISHABLE_KEY ||
  'pk_a2f0825ab169a70b98f5a520693ca5e8e633f36c1b5dabd5548326c5451c4e6d';

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
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState(() => localStorage.getItem('applied_promo_code') || '');
  const [discount, setDiscount] = useState(() => Number(localStorage.getItem('applied_promo_discount') || 0));
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [isAutomatic, setIsAutomatic] = useState(() => !localStorage.getItem('applied_promo_code_manual') && !!localStorage.getItem('applied_promo_code'));
  const [autoPromoDismissed, setAutoPromoDismissed] = useState(false);
  const [availablePromotions, setAvailablePromotions] = useState<any[]>([]);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await fetch(`${MEDUSA_BACKEND_URL}/store/promotions`, {
          headers: {
            'x-publishable-api-key': PUBLISHABLE_KEY
          }
        });
        if (res.ok) {
          const data = await res.json();
          setAvailablePromotions(data.promotions || []);
        }
      } catch (err) {
        console.error("Failed to fetch promotions:", err);
      }
    };
    fetchPromotions();
  }, []);


  const shippingFee = 0;

  const validatePromo = async (codeToValidate: string, isManualCheck = true) => {
    if (!codeToValidate.trim() || items.length === 0) return;
    setPromoLoading(true);
    setPromoError('');
    setPromoSuccess('');
    try {
      const response = await fetch(`${MEDUSA_BACKEND_URL}/store/promotions/validate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-publishable-api-key': PUBLISHABLE_KEY
        },
        body: JSON.stringify({
          code: codeToValidate.trim(),
          items: items.map(item => ({
            id: item.id,
            productId: item.productId,
            price: item.price,
            qty: item.qty
          }))
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setDiscount(data.discount);
        setAppliedPromoCode(data.code);
        setIsAutomatic(!!data.isAutomatic);
        
        if (data.isAutomatic) {
          setPromoSuccess(`Khuyến mãi tự động (${data.code}): Giảm ${(data.discount).toLocaleString('vi-VN')}đ`);
          localStorage.removeItem('applied_promo_code_manual');
        } else {
          setPromoSuccess(`Áp dụng thành công mã ${data.code}: Giảm ${(data.discount).toLocaleString('vi-VN')}đ`);
          localStorage.setItem('applied_promo_code_manual', data.code);
        }
        localStorage.setItem('applied_promo_code', data.code);
        localStorage.setItem('applied_promo_discount', data.discount.toString());
      } else {
        if (isManualCheck) {
          setPromoError(data.message || 'Mã giảm giá không hợp lệ.');
        }
        if (isManualCheck) {
          setDiscount(0);
          setAppliedPromoCode('');
          setIsAutomatic(false);
          localStorage.removeItem('applied_promo_code');
          localStorage.removeItem('applied_promo_discount');
          localStorage.removeItem('applied_promo_code_manual');
          checkForAutoPromo();
        } else {
          setDiscount(0);
          setAppliedPromoCode('');
          setIsAutomatic(false);
          localStorage.removeItem('applied_promo_code');
          localStorage.removeItem('applied_promo_discount');
        }
      }
    } catch (err) {
      console.error(err);
      if (isManualCheck) {
        setPromoError('Lỗi kết nối khi xác thực mã.');
      }
      setDiscount(0);
      setAppliedPromoCode('');
      setIsAutomatic(false);
      localStorage.removeItem('applied_promo_code');
      localStorage.removeItem('applied_promo_discount');
      localStorage.removeItem('applied_promo_code_manual');
    } finally {
      setPromoLoading(false);
    }
  };

  const checkForAutoPromo = async () => {
    if (items.length === 0 || autoPromoDismissed) return;
    try {
      const response = await fetch(`${MEDUSA_BACKEND_URL}/store/promotions/validate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-publishable-api-key': PUBLISHABLE_KEY
        },
        body: JSON.stringify({
          code: "",
          items: items.map(item => ({
            id: item.id,
            productId: item.productId,
            price: item.price,
            qty: item.qty
          }))
        })
      });

      const data = await response.json();
      if (response.ok && data.success && data.isAutomatic) {
        setDiscount(data.discount);
        setAppliedPromoCode(data.code);
        setIsAutomatic(true);
        setPromoSuccess(`Khuyến mãi tự động (${data.code}): Giảm ${(data.discount).toLocaleString('vi-VN')}đ`);
        localStorage.setItem('applied_promo_code', data.code);
        localStorage.setItem('applied_promo_discount', data.discount.toString());
        localStorage.removeItem('applied_promo_code_manual');
      } else {
        setDiscount(0);
        setAppliedPromoCode('');
        setIsAutomatic(false);
        localStorage.removeItem('applied_promo_code');
        localStorage.removeItem('applied_promo_discount');
      }
    } catch (err) {
      console.error("Failed to check automatic promotion:", err);
    }
  };

  const getPromotionRuleLabel = (promo: any) => {
    if (!promo.target_rules || promo.target_rules.length === 0) {
      return promo.is_automatic ? 'Tự động áp dụng' : 'Mã giảm giá';
    }
    
    const rulesText = promo.target_rules.map((rule: any) => {
      if (rule.collection_title) {
        return `dòng ${rule.collection_title}`;
      }
      if (rule.product_title) {
        return `sản phẩm ${rule.product_title}`;
      }
      return '';
    }).filter(Boolean).join(', ');

    if (rulesText) {
      return `Chỉ áp dụng cho ${rulesText}`;
    }
    return promo.is_automatic ? 'Tự động áp dụng' : 'Mã giảm giá';
  };


  useEffect(() => {
    const manualCode = localStorage.getItem('applied_promo_code_manual');
    if (manualCode && items.length > 0) {
      validatePromo(manualCode, true);
    } else if (items.length > 0 && !autoPromoDismissed) {
      checkForAutoPromo();
    } else {
      setDiscount(0);
      setAppliedPromoCode('');
      setIsAutomatic(false);
      localStorage.removeItem('applied_promo_code');
      localStorage.removeItem('applied_promo_discount');
      localStorage.removeItem('applied_promo_code_manual');
    }
  }, [items, autoPromoDismissed]);

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

  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
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
                <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Ticket size={20} fill="#2563eb" color="#2563eb" style={{ transform: 'rotate(-45deg)' }} />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#111' }}>Mã khuyến mãi</span>
                  </div>

                  {appliedPromoCode && !isAutomatic ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#eff6ff', border: '1px dashed #3b82f6', padding: '10px 12px', borderRadius: '6px' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#2563eb' }}>{appliedPromoCode}</div>
                        <div style={{ fontSize: '11px', color: '#1d4ed8', marginTop: '2px' }}>Giảm {discount.toLocaleString('vi-VN')}đ</div>
                      </div>
                      <button 
                        onClick={() => {
                          setAppliedPromoCode('');
                          setDiscount(0);
                          setPromoSuccess('');
                          setPromoError('');
                          setPromoCodeInput('');
                          localStorage.removeItem('applied_promo_code');
                          localStorage.removeItem('applied_promo_discount');
                          localStorage.removeItem('applied_promo_code_manual');
                          checkForAutoPromo();
                        }} 
                        style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Gỡ bỏ
                      </button>
                    </div>
                  ) : (
                    <div>
                      {appliedPromoCode && isAutomatic && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdf4', border: '1px dashed #22c55e', padding: '10px 12px', borderRadius: '6px', marginBottom: '12px' }}>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a' }}>🎉 Tự động áp dụng: {appliedPromoCode}</div>
                            <div style={{ fontSize: '11px', color: '#15803d', marginTop: '2px' }}>Giảm {discount.toLocaleString('vi-VN')}đ</div>
                          </div>
                          <button 
                            onClick={() => {
                              setAutoPromoDismissed(true);
                              setAppliedPromoCode('');
                              setDiscount(0);
                              setPromoSuccess('');
                              setPromoError('');
                              localStorage.removeItem('applied_promo_code');
                              localStorage.removeItem('applied_promo_discount');
                            }} 
                            style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Tắt
                          </button>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          type="text" 
                          placeholder="Nhập mã giảm giá khác..." 
                          value={promoCodeInput}
                          onChange={(e) => setPromoCodeInput(e.target.value)}
                          style={{ flex: 1, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                          disabled={promoLoading}
                        />
                        <button 
                          onClick={() => validatePromo(promoCodeInput, true)}
                          disabled={promoLoading || !promoCodeInput.trim()}
                          style={{ 
                            background: '#2563eb', 
                            color: '#fff', 
                            border: 'none', 
                            padding: '8px 16px', 
                            borderRadius: '6px', 
                            fontSize: '13px', 
                            fontWeight: 600, 
                            cursor: (promoLoading || !promoCodeInput.trim()) ? 'not-allowed' : 'pointer',
                            opacity: (promoLoading || !promoCodeInput.trim()) ? 0.7 : 1
                          }}
                        >
                          {promoLoading ? 'Đang áp dụng...' : 'Áp dụng'}
                        </button>
                      </div>
                      {promoError && (
                        <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>⚠️</span> {promoError}
                        </div>
                      )}
                      {promoSuccess && !isAutomatic && (
                        <div style={{ color: '#16a34a', fontSize: '12px', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>✅</span> {promoSuccess}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Suggestion list of available promotions */}
                  {availablePromotions.length > 0 && (
                    <div style={{ marginTop: '16px', borderTop: '1px dashed #e5e7eb', paddingTop: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563', marginBottom: '8px' }}>
                        Khuyến mãi dành cho bạn:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {availablePromotions.map((promo) => {
                          const valueFormatted = promo.app_method_type === 'percentage' 
                            ? `${promo.app_method_value}%` 
                            : `${Number(promo.app_method_value).toLocaleString('vi-VN')}đ`;
                          
                          const isApplied = appliedPromoCode === promo.code;

                          return (
                            <div 
                              key={promo.id} 
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between', 
                                background: '#fff', 
                                border: isApplied ? '1px solid #3b82f6' : '1px solid #e5e7eb', 
                                borderRadius: '6px', 
                                padding: '8px 10px',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ 
                                  background: promo.is_automatic ? '#f0fdf4' : '#eff6ff', 
                                  color: promo.is_automatic ? '#16a34a' : '#2563eb', 
                                  padding: '2px 6px', 
                                  borderRadius: '4px', 
                                  fontSize: '11px', 
                                  fontWeight: 700,
                                  border: promo.is_automatic ? '1px solid #bbf7d0' : '1px solid #bfdbfe'
                                }}>
                                  {promo.code}
                                </span>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#1f2937' }}>
                                    Giảm {valueFormatted}
                                  </span>
                                  <span style={{ fontSize: '10px', color: '#6b7280' }}>
                                    {getPromotionRuleLabel(promo)}
                                  </span>
                                </div>
                              </div>
                              {!promo.is_automatic && (
                                <button
                                  onClick={() => {
                                    if (isApplied) {
                                      // Gỡ bỏ
                                      setAppliedPromoCode('');
                                      setDiscount(0);
                                      setPromoSuccess('');
                                      setPromoError('');
                                      setPromoCodeInput('');
                                      localStorage.removeItem('applied_promo_code');
                                      localStorage.removeItem('applied_promo_discount');
                                      localStorage.removeItem('applied_promo_code_manual');
                                      checkForAutoPromo();
                                    } else {
                                      setPromoCodeInput(promo.code);
                                      validatePromo(promo.code, true);
                                    }
                                  }}
                                  style={{ 
                                    background: isApplied ? '#ef4444' : '#2563eb', 
                                    color: '#fff', 
                                    border: 'none', 
                                    padding: '4px 10px', 
                                    borderRadius: '4px', 
                                    fontSize: '11px', 
                                    fontWeight: 600, 
                                    cursor: 'pointer' 
                                  }}
                                >
                                  {isApplied ? 'Gỡ bỏ' : 'Áp dụng'}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
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
                  {appliedPromoCode && discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#444' }}>
                      <span>Khuyến mãi ({appliedPromoCode})</span>
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