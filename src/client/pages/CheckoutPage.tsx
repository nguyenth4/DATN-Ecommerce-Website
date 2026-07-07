import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  MapPin, 
  Truck, 
  CreditCard, 
  ChevronRight, 
  ChevronLeft, 
  ShoppingBag, 
  CheckCircle2,
  Lock,
  User
} from 'lucide-react';
import './CheckoutPage.css';
import { getCart, clearCart } from '../utils/cart';
import type { CartItem } from '../utils/cart';
import { productService } from '../services/product.service';

interface Location {
  id: string;
  name: string;
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('vnpay');
  const [shippingMethod, setShippingMethod] = useState('ghn');

  // Cart & Stock State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    setCartItems(getCart());
  }, []);

  // Validate stock when cart items change
  useEffect(() => {
    if (cartItems.length === 0) {
      setValidationErrors([]);
      return;
    }

    const validateStock = async () => {
      try {
        const productIds = Array.from(
          new Set(
            cartItems
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
        cartItems.forEach(item => {
          if (item.id.startsWith('mock-')) {
            return; // Mock items always pass
          }
          const actualStock = stockMap[item.id];
          if (actualStock === undefined) {
            errors.push(`Sản phẩm "${item.name}" không còn tồn tại hoặc đã hết hàng.`);
          } else if (actualStock === 0) {
            errors.push(`Sản phẩm "${item.name}" đã hết hàng tạm thời.`);
          } else if (actualStock < item.qty) {
            errors.push(`Sản phẩm "${item.name}" chỉ còn ${actualStock} sản phẩm trong kho. Bạn đang có ${item.qty} trong giỏ.`);
          }
        });

        setValidationErrors(errors);
      } catch (err) {
        console.error("Error validating stock in checkout:", err);
      }
    };

    validateStock();
  }, [cartItems]);
  
  // Location State
  const [provinces, setProvinces] = useState<Location[]>([]);
  const [districts, setDistricts] = useState<Location[]>([]);
  const [wards, setWards] = useState<Location[]>([]);
  
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('');
  
  // Customer & Address State
  const [fullName, setFullName] = useState('Hỷ Huỳnh Trần Khang');
  const [phoneNumber, setPhoneNumber] = useState('(+84) 824 421 498');
  const [email, setEmail] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [note, setNote] = useState('');
  
  // Computed Merged Address
  const provinceName = provinces.find(p => p.id === selectedProvince)?.name || '';
  const districtName = districts.find(d => d.id === selectedDistrict)?.name || '';
  const wardName = wards.find(w => w.id === selectedWard)?.name || '';
  
  const mergedAddress = [detailAddress, wardName, districtName, provinceName]
    .filter(part => part && part.trim() !== '')
    .join(', ');


  // Fetch Provinces on mount
  useEffect(() => {
    fetch('https://esgoo.net/api-tinhthanh/1/0.htm')
      .then(res => res.json())
      .then(data => {
        if (data.error === 0) setProvinces(data.data);
      })
      .catch(err => console.error("Error fetching provinces:", err));
  }, []);

  // Fetch Districts when Province changes
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
        .catch(err => console.error("Error fetching districts:", err));
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [selectedProvince]);

  // Fetch Wards when District changes
  useEffect(() => {
    if (selectedDistrict) {
      fetch(`https://esgoo.net/api-tinhthanh/3/${selectedDistrict}.htm`)
        .then(res => res.json())
        .then(data => {
          if (data.error === 0) setWards(data.data);
          else setWards([]);
          setSelectedWard('');
        })
        .catch(err => console.error("Error fetching wards:", err));
    } else {
      setWards([]);
    }
  }, [selectedDistrict]);

  const handlePlaceOrder = async () => {
    // Show a premium success transition
    const orderData = {
        customer: {
            fullName,
            phoneNumber,
            email,
        },
        paymentMethod,
        shippingMethod,
        address: mergedAddress,
        addressComponents: {
            province: provinceName,
            district: districtName,
            ward: wardName,
            detail: detailAddress
        },
        note,
        items: cartItems,
    };

    console.log("Placing order...", orderData);
    
    try {
      const response = await fetch('http://localhost:9000/store/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const data = await response.json();
      
      clearCart();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      clearCart();
    }

    setTimeout(() => {
      navigate('/order-success');
    }, 2000);
  };

  // Calculate dynamic package properties based on cart items
  const totalWeight = cartItems.reduce((acc, item) => acc + ((item.weight || 250) * item.qty), 0);
  const totalHeight = cartItems.reduce((acc, item) => acc + ((item.height || 5) * item.qty), 0);
  const maxLength = cartItems.length > 0 ? Math.max(...cartItems.map(item => item.length || 10)) : 10;
  const maxWidth = cartItems.length > 0 ? Math.max(...cartItems.map(item => item.width || 10)) : 10;
  const insuranceValue = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const [shippingFee, setShippingFee] = useState(35000);
  
  useEffect(() => {
    // Call Shipping Fee API when district/ward changes
    if (selectedDistrict && selectedWard) {
      // 2: Nhanh (Express), 5: Tiết kiệm (Economy - using GHN API as proxy for economy rates)
      const serviceTypeId = shippingMethod === 'ghn' ? 2 : 5;

      fetch('http://localhost:9000/store/ghn/fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_district_id: 1442,
          from_ward_code: "21211",
          service_type_id: serviceTypeId,
          to_district_id: parseInt(selectedDistrict) || 1442,
          to_ward_code: selectedWard || "21211",
          height: totalHeight || 10,
          length: maxLength || 10,
          weight: totalWeight || 200,
          width: maxWidth || 10,
          insurance_value: insuranceValue > 5000000 ? 5000000 : insuranceValue, // GHN insurance limit 
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
      .catch(error => {
        console.error("Fee API error:", error);
        setShippingFee(0);
      });
    } else {
      // Default initial prices before location is selected
      setShippingFee(0);
    }
  }, [selectedDistrict, selectedWard, shippingMethod, totalHeight, maxLength, totalWeight, maxWidth, insuranceValue]);

  const total = subtotal + shippingFee;

  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <div className="checkout-container">
          <nav className="checkout-nav-content">
            <Link to="/" className="checkout-logo">
              <ShoppingBag size={28} />
              <span>Sprylo</span>
            </Link>

            <div className="checkout-steps">
               <div className="step-item active">
                 <span className="step-number">1</span>
                 <span>Thông tin</span>
                 <ChevronRight size={16} />
               </div>
               <div className="step-item">
                 <span className="step-number">2</span>
                 <span>Thanh toán</span>
                 <ChevronRight size={16} />
               </div>
               <div className="step-item">
                 <span className="step-number">3</span>
                 <span>Hoàn tất</span>
               </div>
            </div>
            <Link to="/cart" className="checkout-text-soft">
              <Lock size={20} />
            </Link>

          </nav>
        </div>
      </header>

      <main className="checkout-container">
        <div className="checkout-grid">
          {/* LEFT: INFORMATION FORM */}
          <div className="checkout-main">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="checkout-section"
            >
              <h2 className="section-title">
                <User size={22} /> Thông tin khách hàng
              </h2>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Họ và tên *</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Nguyễn Văn A" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại *</label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    placeholder="09xx xxx xxx" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email (nhận vận đơn)</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="checkout-section"
            >
              <h2 className="section-title">
                <MapPin size={22} /> Địa chỉ nhận hàng (Mới)
              </h2>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Tỉnh / Thành phố *</label>
                  <select 
                    className="form-select" 
                    value={selectedProvince} 
                    onChange={(e) => setSelectedProvince(e.target.value)}
                  >
                    <option value="">Chọn tỉnh/thành</option>
                    {provinces.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Quận / Huyện *</label>
                  <select 
                    className="form-select" 
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    disabled={!selectedProvince}
                  >
                    <option value="">Chọn quận/huyện</option>
                    {districts.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Phường / Xã *</label>
                  <select 
                    className="form-select"
                    value={selectedWard}
                    onChange={(e) => setSelectedWard(e.target.value)}
                    disabled={!selectedDistrict}
                  >
                    <option value="">Chọn phường/xã</option>
                    {wards.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Địa chỉ chi tiết *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Số nhà, tên đường..." 
                    value={detailAddress}
                    onChange={(e) => setDetailAddress(e.target.value)}
                  />
                </div>
              </div>
              
              {mergedAddress && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="merged-address-preview"
                >
                  <div className="preview-label">Địa chỉ sáp nhập:</div>
                  <div className="preview-content">{mergedAddress}</div>
                </motion.div>
              )}

              <div className="form-group mb-0">
                <label className="form-label">Ghi chú (tùy chọn)</label>
                <textarea 
                  className="form-input" 
                  rows={2} 
                  placeholder="Giao giờ hành chính, gọi trước khi đến..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                ></textarea>
              </div>

            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="checkout-section"
            >
              <h2 className="section-title">
                <Truck size={22} /> Đơn vị vận chuyển
              </h2>
              <div className="option-grid">
                <div 
                  className={`option-card ${shippingMethod === 'ghn' ? 'selected' : ''}`}
                  onClick={() => setShippingMethod('ghn')}
                >
                  <div className="option-card-header">
                    <span className="option-name">Giao hàng Nhanh</span>
                    <span className="option-price">{shippingMethod === 'ghn' && shippingFee > 0 ? `${shippingFee.toLocaleString('vi-VN')}đ` : 'Chưa tính'}</span>
                  </div>
                  <span className="option-desc">Giao tốc hành 1-2 ngày</span>
                  {shippingMethod === 'ghn' && <div className="check-badge"><CheckCircle2 size={12} /></div>}
                </div>
                <div 
                  className={`option-card ${shippingMethod === 'ghtk' ? 'selected' : ''}`}
                  onClick={() => setShippingMethod('ghtk')}
                >
                  <div className="option-card-header">
                    <span className="option-name">Giao hàng Tiết kiệm</span>
                    <span className="option-price">{shippingMethod === 'ghtk' && shippingFee > 0 ? `${shippingFee.toLocaleString('vi-VN')}đ` : 'Chưa tính'}</span>
                  </div>
                  <span className="option-desc">Giao tiêu chuẩn 3-4 ngày</span>
                  {shippingMethod === 'ghtk' && <div className="check-badge"><CheckCircle2 size={12} /></div>}
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="checkout-section"
            >
              <h2 className="section-title">
                <CreditCard size={22} /> Phương thức thanh toán
              </h2>
              <div className="option-grid">
                <div 
                  className={`option-card ${paymentMethod === 'vnpay' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('vnpay')}
                >
                  <div className="option-card-header">
                    <span className="option-name">VNPay</span>
                  </div>
                  <span className="option-desc">Thẻ ATM/QR Code/Visa</span>
                  {paymentMethod === 'vnpay' && <div className="check-badge"><CheckCircle2 size={12} /></div>}
                </div>
                <div 
                  className={`option-card ${paymentMethod === 'momo' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('momo')}
                >
                  <div className="option-card-header">
                    <span className="option-name">Ví MoMo</span>
                  </div>
                  <span className="option-desc">Thanh toán qua ví MoMo</span>
                  {paymentMethod === 'momo' && <div className="check-badge"><CheckCircle2 size={12} /></div>}
                </div>
                <div 
                  className={`option-card ${paymentMethod === 'zalopay' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('zalopay')}
                >
                  <div className="option-card-header">
                    <span className="option-name">ZaloPay</span>
                  </div>
                  <span className="option-desc">Ví ZaloPay tiện lợi</span>
                  {paymentMethod === 'zalopay' && <div className="check-badge"><CheckCircle2 size={12} /></div>}
                </div>
                <div 
                  className={`option-card ${paymentMethod === 'cod' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <div className="option-card-header">
                    <span className="option-name">COD</span>
                  </div>
                  <span className="option-desc">Thanh toán khi nhận hàng</span>
                  {paymentMethod === 'cod' && <div className="check-badge"><CheckCircle2 size={12} /></div>}
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="checkout-sidebar">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="summary-card"
            >
              <h3 className="summary-title">Đơn hàng của bạn</h3>
              
              <div className="item-list">
                {cartItems.map(item => {
                  const imgUrl = item.img.startsWith('http') ? item.img : `https://images.unsplash.com/${item.img}?w=200&q=80&auto=format&fit=crop`;
                  return (
                    <div key={item.id} className="summary-item">
                      <img src={imgUrl} alt={item.name} className="item-img" />
                      <div className="item-info">
                        <div className="item-name">{item.name}</div>
                        <div className="item-price">{item.qty} x {item.price.toLocaleString('vi-VN')}đ</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row">
                <span>Tạm tính</span>
                <span>{subtotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển</span>
                {shippingFee > 0 ? (
                  <span>{shippingFee.toLocaleString('vi-VN')}đ</span>
                ) : (
                  <span style={{ color: 'var(--emerald)', fontWeight: 600 }}>Chưa tính</span>
                )}
              </div>


              <div className="summary-row">
                <span>Giảm giá</span>
                <span>-0đ</span>
              </div>

              <div className="summary-total">
                <span>Tổng cộng</span>
                <span>{total.toLocaleString('vi-VN')}đ</span>
              </div>

              {validationErrors.length > 0 && (
                <div style={{
                  padding: '12px',
                  background: '#fef2f2',
                  borderLeft: '4px solid #ef4444',
                  borderRadius: '6px',
                  color: '#991b1b',
                  fontSize: '0.85rem',
                  marginBottom: '15px'
                }}>
                  <strong>⚠️ Lỗi tồn kho:</strong>
                  <ul style={{ paddingLeft: '15px', marginTop: '5px', listStyleType: 'disc' }}>
                    {validationErrors.map((err, idx) => <li key={idx}>{err}</li>)}
                  </ul>
                </div>
              )}

              <button 
                className="btn-checkout" 
                onClick={handlePlaceOrder}
                disabled={validationErrors.length > 0}
                style={{
                  background: validationErrors.length > 0 ? '#ef4444' : '',
                  borderColor: validationErrors.length > 0 ? '#ef4444' : '',
                  cursor: validationErrors.length > 0 ? 'not-allowed' : 'pointer'
                }}
              >
                {validationErrors.length > 0 ? 'LỖI TỒN KHO - KHÔNG THỂ THANH TOÁN' : 'HOÀN THÀNH ĐẶT HÀNG'}
                <ChevronRight size={20} />
              </button>


              <div className="trust-badges">
                <div className="trust-badge">
                  <ShieldCheck size={20} />
                  <span>Bảo mật</span>
                </div>
                <div className="trust-badge">
                  <Truck size={20} />
                  <span>Giao nhanh</span>
                </div>
                <div className="trust-badge">
                  <CheckCircle2 size={20} />
                  <span>Chính hãng</span>
                </div>
              </div>
            </motion.div>
            
            <div className="mt-4" style={{ textAlign: 'center' }}>
              <Link to="/cart" className="checkout-text-soft" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <ChevronLeft size={16} /> Quay lại giỏ hàng
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
