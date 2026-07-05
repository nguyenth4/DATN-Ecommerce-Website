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
  User,
  Wallet
} from 'lucide-react';
import './CheckoutPage.css';
import { walletService } from '../services/wallet.service';

interface Location {
  id: string;
  name: string;
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('vnpay');
  const [shippingMethod, setShippingMethod] = useState('ghn');
  
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
  
  // Wallet State
  const [walletData, setWalletData] = useState<any>(null);
  const [useWallet, setUseWallet] = useState(false);
  
  // Computed Merged Address
  const provinceName = provinces.find(p => p.id === selectedProvince)?.name || '';
  const districtName = districts.find(d => d.id === selectedDistrict)?.name || '';
  const wardName = wards.find(w => w.id === selectedWard)?.name || '';
  
  const mergedAddress = [detailAddress, wardName, districtName, provinceName]
    .filter(part => part && part.trim() !== '')
    .join(', ');


  // Fetch Provinces on mount
  useEffect(() => {
    // Load wallet
    walletService.getWallet('cus_demo_123')
      .then(res => setWalletData(res.wallet))
      .catch(console.error);

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
        use_wallet: useWallet,
        customer_id: 'cus_demo_123'
    };

    console.log("Placing order...", orderData);
    
    try {
      const data = await walletService.checkout(orderData);
      
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
    } catch (error) {
      console.error("Checkout failed:", error);
    }

    setTimeout(() => {
      navigate('/order-success');
    }, 2000);
  };

  const cartItems = [
    { 
      id: 1, 
      name: "iPhone 16 Pro Max 512GB Titanium", 
      price: 34990000, 
      qty: 1, 
      img: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-pro-max-titan-sa-mac.png",
      weight: 250, // grams
      height: 5,   // cm
      length: 16,  // cm
      width: 8     // cm
    }
  ];

  // Calculate dynamic package properties based on cart items
  const totalWeight = cartItems.reduce((acc, item) => acc + (item.weight * item.qty), 0);
  const totalHeight = cartItems.reduce((acc, item) => acc + (item.height * item.qty), 0);
  const maxLength = Math.max(...cartItems.map(item => item.length), 10);
  const maxWidth = Math.max(...cartItems.map(item => item.width), 10);
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

  const rawTotal = subtotal + shippingFee;
  const walletBalance = walletData ? Number(walletData.balance) : 0;
  
  let walletDeducted = 0;
  let finalTotal = rawTotal;

  if (useWallet) {
    if (walletBalance >= rawTotal) {
      walletDeducted = rawTotal;
      finalTotal = 0;
    } else {
      walletDeducted = walletBalance;
      finalTotal = rawTotal - walletBalance;
    }
  }

  // Auto select wallet as payment method if fully covered
  useEffect(() => {
    if (finalTotal === 0 && useWallet) {
      setPaymentMethod('wallet');
    } else if (paymentMethod === 'wallet' && finalTotal > 0) {
      setPaymentMethod('vnpay');
    }
  }, [finalTotal, useWallet, paymentMethod]);

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
                <Wallet size={22} /> Thanh toán bằng ví
              </h2>
              {walletData && (
                <div 
                  className={`option-card ${useWallet ? 'selected' : ''}`}
                  onClick={() => setUseWallet(!useWallet)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <div className="option-name">Sử dụng ví điện tử Sprylo</div>
                    <div className="option-desc" style={{ marginTop: '0.2rem' }}>
                      Số dư khả dụng: <strong style={{ color: 'var(--indigo)' }}>{walletBalance.toLocaleString('vi-VN')}đ</strong>
                    </div>
                  </div>
                  <div className={`custom-toggle ${useWallet ? 'active' : ''}`}>
                    <div className="toggle-knob"></div>
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`checkout-section ${finalTotal === 0 ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <h2 className="section-title">
                <CreditCard size={22} /> Phương thức thanh toán bổ sung
              </h2>
              {finalTotal === 0 && (
                <div className="alert-info" style={{ marginBottom: '1rem', padding: '0.8rem', background: 'var(--indigo-soft)', color: 'var(--indigo-deep)', borderRadius: 'var(--r-sm)', fontSize: '0.9rem' }}>
                  Đơn hàng đã được thanh toán toàn bộ bằng Ví điện tử.
                </div>
              )}
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
                {cartItems.map(item => (
                  <div key={item.id} className="summary-item">
                    <img src={item.img} alt={item.name} className="item-img" />
                    <div className="item-info">
                      <div className="item-name">{item.name}</div>
                      <div className="item-price">{item.qty} x {item.price.toLocaleString('vi-VN')}đ</div>
                    </div>
                  </div>
                ))}
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

              {useWallet && walletDeducted > 0 && (
                <div className="summary-row" style={{ color: 'var(--indigo)', fontWeight: 600 }}>
                  <span>Thanh toán từ ví</span>
                  <span>-{walletDeducted.toLocaleString('vi-VN')}đ</span>
                </div>
              )}

              <div className="summary-total">
                <span>Tổng cộng cần thanh toán</span>
                <span style={{ fontSize: '1.4rem' }}>{finalTotal.toLocaleString('vi-VN')}đ</span>
              </div>

              <button className="btn-checkout" onClick={handlePlaceOrder}>
                HOÀN THÀNH ĐẶT HÀNG
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
