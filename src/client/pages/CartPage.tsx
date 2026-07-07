import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Minus, 
  X, 
  ChevronRight, 
  ArrowLeft,
  Zap,
  RotateCcw,
  Star,
  ShieldCheck
} from 'lucide-react';
import { getCart, updateCartQty, removeFromCart } from '../utils/cart';
import type { CartItem } from '../utils/cart';
import { productService } from '../services/product.service';

const PROMO_CODE = 'WELCOME20';
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
    if (items.length === 0) {
      setValidationErrors([]);
      return;
    }

    const validateStock = async () => {
      try {
        const productIds = Array.from(
          new Set(
            items
              .map(item => item.productId)
              .filter(id => id && !id.startsWith('mock-'))
          )
        );

        if (productIds.length === 0) {
          setValidationErrors([]);
          return;
        }

        const { products } = await productService.getProducts({ id: productIds });
        
        const errors: string[] = [];
        const stockMap: Record<string, number> = {};

        // Build stock map from actual Medusa variants
        products.forEach((p: any) => {
          p.variants?.forEach((v: any) => {
            stockMap[v.id] = v.inventory_quantity !== undefined ? v.inventory_quantity : 999;
          });
        });

        // Validate each item in the cart
        items.forEach(item => {
          if (item.id.startsWith('mock-')) {
            return; // Mock items always pass
          }
          const actualStock = stockMap[item.id];
          if (actualStock === undefined) {
            errors.push(`Sản phẩm "${item.name}" (${item.variant}) không còn tồn tại hoặc đã hết hàng.`);
          } else if (actualStock === 0) {
            errors.push(`Sản phẩm "${item.name}" (${item.variant}) đã hết hàng tạm thời.`);
          } else if (actualStock < item.qty) {
            errors.push(`Sản phẩm "${item.name}" (${item.variant}) chỉ còn ${actualStock} sản phẩm trong kho. Bạn đang có ${item.qty} trong giỏ.`);
          }
        });

        setStockInfo(stockMap);
        setValidationErrors(errors);
      } catch (err) {
        console.error("Error validating stock:", err);
      }
    };

    validateStock();
  }, [items]);
  const [promo, setPromo] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  // Shipping Fee State
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  
  const [shippingFee, setShippingFee] = useState<number>(0);

  // Fetch Provinces
  useEffect(() => {
    fetch('https://esgoo.net/api-tinhthanh/1/0.htm')
      .then(res => res.json())
      .then(data => {
        if (data.error === 0) setProvinces(data.data);
      })
      .catch(console.error);
  }, []);

  // Fetch Districts
  useEffect(() => {
    if (selectedProvince) {
      fetch(`https://esgoo.net/api-tinhthanh/2/${selectedProvince}.htm`)
        .then(res => res.json())
        .then(data => {
          if (data.error === 0) setDistricts(data.data);
          else setDistricts([]);
          setWards([]);
          setSelectedDistrict('');
          setSelectedWard('');
        })
        .catch(console.error);
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [selectedProvince]);

  // Fetch Wards
  useEffect(() => {
    if (selectedDistrict) {
      fetch(`https://esgoo.net/api-tinhthanh/3/${selectedDistrict}.htm`)
        .then(res => res.json())
        .then(data => {
          if (data.error === 0) setWards(data.data);
          else setWards([]);
          setSelectedWard('');
        })
        .catch(console.error);
    } else {
      setWards([]);
    }
  }, [selectedDistrict]);

  // Fetch Shipping Fee
  useEffect(() => {
    if (selectedDistrict && selectedWard) {
      const totalWeight = items.reduce((acc, item) => acc + 250 * item.qty, 0);
      const insuranceValue = items.reduce((acc, item) => acc + item.price * item.qty, 0);

      fetch('http://localhost:9000/store/ghn/fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_district_id: 1442,
          from_ward_code: "21211",
          service_type_id: 2, // GHN Express
          to_district_id: parseInt(selectedDistrict) || 1442,
          to_ward_code: selectedWard,
          height: 10,
          length: 15,
          weight: totalWeight || 250,
          width: 10,
          insurance_value: insuranceValue > 5000000 ? 5000000 : insuranceValue,
          cod_failed_amount: 2000,
          coupon: null
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.data?.total) {
          setShippingFee(data.data.total);
        } else {
          setShippingFee(0);
        }
      })
      .catch((err) => {
        console.error(err);
        setShippingFee(0);
      });
    } else {
      setShippingFee(0);
    }
  }, [selectedDistrict, selectedWard, items]);

  const updateQty = (id: string, delta: number) => {
    const updated = items.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
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
    if (promo.trim().toUpperCase() === PROMO_CODE) {
      setPromoApplied(true);
    }
  };

  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = Math.round(subtotal * 0.08);
  const discount = promoApplied ? PROMO_DISCOUNT : 0;
  const total = subtotal + tax + shippingFee - discount;


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
                                {isOutOfStock ? 'Hết hàng tạm thời' : (isInsufficient ? `Chỉ còn ${actualStock} sản phẩm` : `Còn hàng (${actualStock} sản phẩm)`)}
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

              <aside className="cart-summary">
                <h3>Tóm tắt đơn hàng</h3>

                <div className="promo-input">
                  <input
                    type="text"
                    placeholder="Mã giảm giá"
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                  />
                  <button onClick={applyPromo}>Áp dụng</button>
                </div>

                <div style={{ marginBottom: 'var(--s4)' }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px', color: 'var(--fg-mute)' }}>TÍNH PHÍ VẬN CHUYỂN (GHN)</p>
                  <select 
                    style={{ width: '100%', padding: '10px', marginBottom: '8px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg)' }}
                    value={selectedProvince} onChange={e => setSelectedProvince(e.target.value)}
                  >
                    <option value="">Chọn Tỉnh/Thành phố</option>
                    {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <select 
                    style={{ width: '100%', padding: '10px', marginBottom: '8px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg)' }}
                    value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)}
                    disabled={!selectedProvince}
                  >
                    <option value="">Chọn Quận/Huyện</option>
                    {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <select 
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg)' }}
                    value={selectedWard} onChange={e => setSelectedWard(e.target.value)}
                    disabled={!selectedDistrict}
                  >
                    <option value="">Chọn Phường/Xã</option>
                    {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>

                <div className="cart-line">
                  <span>Tạm tính · {itemCount} sản phẩm</span>
                  <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="cart-line">
                  <span>Phí vận chuyển</span>
                  {shippingFee > 0 ? (
                    <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{shippingFee.toLocaleString('vi-VN')}đ</span>
                  ) : (
                    <span style={{ color: 'var(--emerald)', fontWeight: 600 }}>Chưa tính</span>
                  )}
                </div>
                <div className="cart-line">
                  <span>Thuế ước tính (8%)</span>
                  <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{tax.toLocaleString('vi-VN')}đ</span>
                </div>
                {promoApplied && (
                  <div className="cart-line">
                    <span>Khuyến mãi · {PROMO_CODE}</span>
                    <span style={{ color: 'var(--rose)', fontWeight: 600 }}>−{discount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}

                <div className="cart-line is-total"><span>Tổng cộng</span><span>{total.toLocaleString('vi-VN')}đ</span></div>


                {validationErrors.length > 0 ? (
                  <button 
                    className="btn btn--block" 
                    style={{ 
                      background: '#ef4444', 
                      color: '#fff', 
                      cursor: 'not-allowed',
                      opacity: 0.8
                    }} 
                    disabled
                  >
                    Vui lòng sửa lỗi tồn kho
                  </button>
                ) : (
                  <Link to="/checkout" className="btn btn--indigo btn--block">Tiến hành thanh toán <ChevronRight size={18} style={{marginLeft: '4px'}}/></Link>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--s3)', marginTop: 'var(--s5)', flexWrap: 'wrap' }}>
                  {['VISA', 'MASTERCARD', 'AMEX', 'PAYPAL', 'APPLE PAY'].map((method) => (
                    <span
                      key={method}
                      style={{ fontSize: '11px', color: 'var(--fg-mute)', padding: '6px 10px', background: 'var(--paper)', borderRadius: '4px' }}
                    >
                      {method}
                    </span>
                  ))}
                </div>

                <p style={{ marginTop: 'var(--s5)', fontSize: '11px', color: 'var(--fg-mute)', textAlign: 'center', lineHeight: 1.6 }}>
                   <ShieldCheck size={12} style={{display: 'inline', verticalAlign: 'middle', marginRight: '4px'}}/> Giao dịch <Link to="/checkout" style={{ color: 'inherit', textDecoration: 'underline' }}>thanh toán</Link> được mã hoá · Bảo mật SSL. Thông tin thanh toán không bao giờ được lưu trữ trên máy chủ của chúng tôi.
                </p>
              </aside>

            </div>
          </div>
        </section>

      </main>
    </>
  );
};

export default CartPage;