import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  ChevronLeft,
  ArrowLeft,
  ChevronDown
} from 'lucide-react';
import { walletService } from '../services/wallet.service';
import { motion, AnimatePresence } from 'framer-motion';
// Remove import './CheckoutPage.css'; since we use inline styles now

interface Location {
  id: string;
  name: string;
}

const PRIMARY_COLOR = '#2563eb'; // Blue

const checkoutStyles = `
  .cps-checkout-page {
    background-color: #f4f6f8;
    min-height: 100vh;
    font-family: 'Inter', sans-serif;
    padding-bottom: 140px;
  }
  .cps-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 0 16px;
  }
  .cps-header {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 12px 0;
    margin-bottom: 8px;
    background: #f4f6f8;
  }
  .cps-back-btn {
    position: absolute;
    left: 0;
    color: #444;
    display: flex;
    align-items: center;
    cursor: pointer;
    text-decoration: none;
  }
  .cps-title {
    font-size: 18px;
    font-weight: 600;
    color: #000;
  }
  .cps-step-tabs {
    display: flex;
    border-bottom: 2px solid #e5e7eb;
    margin-bottom: 16px;
    background: #f4f6f8;
  }
  .cps-step-tab {
    flex: 1;
    text-align: center;
    padding: 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #9ca3af;
    position: relative;
    cursor: pointer;
  }
  .cps-step-tab.active {
    color: ${PRIMARY_COLOR};
  }
  .cps-step-tab.active::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: ${PRIMARY_COLOR};
  }
  .cps-box {
    background: #fff;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
    padding: 16px;
    margin-bottom: 16px;
  }
  .cps-section-title {
    font-size: 14px;
    font-weight: 600;
    color: #4b5563;
    margin-bottom: 12px;
    text-transform: uppercase;
  }
  
  /* Product Info */
  .cps-product-item {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  .cps-product-img {
    width: 60px;
    height: 60px;
    object-fit: contain;
  }
  .cps-product-info {
    flex: 1;
  }
  .cps-product-name {
    font-size: 14px;
    color: #333;
    margin-bottom: 4px;
    line-height: 1.4;
  }
  .cps-product-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .cps-price {
    color: ${PRIMARY_COLOR};
    font-weight: 600;
    font-size: 14px;
  }
  .cps-old-price {
    color: #9ca3af;
    font-size: 12px;
    text-decoration: line-through;
    margin-left: 8px;
  }
  .cps-qty {
    font-size: 14px;
    color: #444;
  }
  
  /* Customer Info */
  .cps-customer-card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 12px;
  }
  .cps-customer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .cps-customer-name {
    font-weight: 600;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .cps-tag {
    background: #fdf2f8;
    color: #db2777;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid #fbcfe8;
  }
  .cps-customer-phone {
    font-size: 14px;
    color: #4b5563;
  }
  
  /* Form Inputs Modern */
  .cps-modern-input-group {
    position: relative;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 16px;
    padding-top: 16px;
  }
  .cps-modern-label {
    position: absolute;
    top: 0;
    left: 0;
    font-size: 11px;
    color: #9ca3af;
    text-transform: uppercase;
  }
  .cps-modern-input, .cps-modern-select {
    width: 100%;
    border: none;
    outline: none;
    padding: 8px 0;
    font-size: 14px;
    color: #333;
    background: transparent;
    appearance: none;
  }
  .cps-select-arrow {
    position: absolute;
    right: 0;
    bottom: 8px;
    pointer-events: none;
    color: #9ca3af;
  }
  .cps-modern-input::placeholder {
    color: #9ca3af;
  }
  
  /* Custom Select */
  .cps-custom-select-wrapper {
    position: relative;
    width: 100%;
  }
  .cps-custom-select-wrapper.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .cps-custom-select-trigger {
    width: 100%;
    padding: 8px 0;
    font-size: 14px;
    color: #333;
    cursor: pointer;
    user-select: none;
  }
  .cps-custom-select-trigger .placeholder {
    color: #9ca3af;
  }
  .cps-custom-select-backdrop {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: 90;
  }
  .cps-custom-select-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    z-index: 100;
    max-height: 240px;
    overflow-y: auto;
    padding: 8px 0;
  }
  .cps-custom-select-option {
    padding: 10px 16px;
    font-size: 14px;
    color: #333;
    cursor: pointer;
    transition: background 0.2s;
  }
  .cps-custom-select-option:hover {
    background: #f3f4f6;
  }
  .cps-custom-select-option.selected {
    background: #eff6ff;
    color: ${PRIMARY_COLOR};
    font-weight: 500;
  }
  .cps-custom-select-empty {
    padding: 10px 16px;
    font-size: 14px;
    color: #9ca3af;
    text-align: center;
  }
  .cps-custom-select-dropdown::-webkit-scrollbar {
    width: 6px;
  }
  .cps-custom-select-dropdown::-webkit-scrollbar-track {
    background: transparent;
  }
  .cps-custom-select-dropdown::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 10px;
  }
  .cps-custom-select-dropdown::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
  .cps-note {
    font-size: 11px;
    color: #9ca3af;
    font-style: italic;
    margin-top: 8px;
  }
  .cps-checkbox-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #333;
    margin-top: 12px;
  }
  
  /* Box without padding for tabs */
  .cps-box-no-pad {
    background: #fff;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    margin-bottom: 16px;
    overflow: hidden;
  }
  
  /* Delivery Tabs Modern */
  .cps-delivery-tabs {
    display: flex;
    background: #f3f4f6;
    border-bottom: 1px solid #e5e7eb;
    border-radius: 8px 8px 0 0;
  }
  .cps-delivery-tab {
    flex: 1;
    padding: 14px 16px;
    font-size: 14px;
    cursor: pointer;
    color: #4b5563;
    display: flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    border-bottom: 1px solid transparent;
    transition: all 0.2s;
    position: relative;
  }
  .cps-delivery-tab.active {
    background: #fff;
    color: #111;
    font-weight: 500;
    margin-bottom: -1px; /* Overlap the bottom border */
    border-bottom: 1px solid #fff;
    border-radius: 8px 8px 0 0;
  }
  .cps-delivery-tab:first-child.active {
    border-right: 1px solid #e5e7eb;
  }
  .cps-delivery-tab:last-child.active {
    border-left: 1px solid #e5e7eb;
  }
  
  .cps-radio-custom {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1px solid #9ca3af;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  }
  .cps-delivery-tab.active .cps-radio-custom {
    border: 1px solid #d70018; /* Red border to match image exactly */
  }
  .cps-delivery-tab.active .cps-radio-custom::after {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #d70018; /* Red dot to match image exactly */
  }
  
  .cps-delivery-content {
    padding: 16px;
    background: #fff;
  }
  
  .cps-modern-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  
  /* Invoice Block */
  .cps-invoice-block {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: #fff;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
    margin-bottom: 16px;
    font-size: 14px;
    font-weight: 500;
  }
  .cps-radio-group {
    display: flex;
    gap: 16px;
  }
  .cps-radio-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 400;
    cursor: pointer;
  }
  
  /* Payment Options */
  .cps-payment-option {
    display: flex;
    align-items: center;
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    margin-bottom: 12px;
    cursor: pointer;
    gap: 12px;
  }
  .cps-payment-option.active {
    border-color: ${PRIMARY_COLOR};
    background: #eff6ff;
  }
  .cps-payment-icon {
    width: 40px;
    height: 40px;
    object-fit: contain;
  }
  .cps-payment-text {
    flex: 1;
    font-size: 14px;
    color: #333;
    font-weight: 500;
  }

  /* Bottom Bar */
  .cps-bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
    padding: 12px 16px;
    z-index: 50;
  }
  .cps-bottom-content {
    max-width: 600px;
    margin: 0 auto;
  }
  .cps-total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .cps-total-label {
    font-size: 14px;
    font-weight: 600;
    color: #111;
  }
  .cps-total-price {
    color: ${PRIMARY_COLOR};
    font-weight: 700;
    font-size: 16px;
  }
  .cps-btn-primary {
    width: 100%;
    background: ${PRIMARY_COLOR};
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 14px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    text-align: center;
    text-transform: uppercase;
  }
  .cps-btn-primary:hover {
    background: #1d4ed8;
  }
  
  /* Shipping Method Box */
  .cps-shipping-method-box {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .cps-shipping-method-box.active {
    border-color: ${PRIMARY_COLOR};
    background: #eff6ff;
  }
`;

const CustomSelect = ({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  disabled = false
}: { 
  value: string; 
  onChange: (val: string) => void; 
  options: {value: string, label: string}[]; 
  placeholder: string;
  disabled?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = options.find(o => o.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className={`cps-custom-select-wrapper ${disabled ? 'disabled' : ''}`}>
      <div 
        className="cps-custom-select-trigger" 
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={!selectedOption ? "placeholder" : ""}>{displayValue}</span>
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="cps-custom-select-backdrop" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="cps-custom-select-dropdown"
            >
              {options.map(opt => (
                <div 
                  key={opt.value} 
                  className={`cps-custom-select-option ${opt.value === value ? 'selected' : ''}`}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                >
                  {opt.label}
                </div>
              ))}
              {options.length === 0 && <div className="cps-custom-select-empty">Không có dữ liệu</div>}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1); // 1: THÔNG TIN, 2: THANH TOÁN
  
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
  const [fullName, setFullName] = useState('Hoàng Nguyện');
  const [phoneNumber, setPhoneNumber] = useState('0982586593');
  const [email, setEmail] = useState('hoangnguyen280004@gmail.com');
  const [detailAddress, setDetailAddress] = useState('');
  const [note, setNote] = useState('');
  
  const [wantInvoice, setWantInvoice] = useState(false);
  
  // Wallet State
  const [walletData, setWalletData] = useState<any>(null);
  const [useWallet, setUseWallet] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const getPaymentLabel = (code: string) => {
    switch(code) {
      case 'vnpay': return 'Thanh toán qua VNPAY';
      case 'momo': return 'Thanh toán qua Ví MoMo';
      case 'zalopay': return 'Thanh toán qua ZaloPay';
      case 'cod': return 'Thanh toán khi nhận hàng';
      default: return 'Chọn phương thức thanh toán';
    }
  };
  
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
    }, 1500);
  };

  const cartItems = [
    { 
      id: 1, 
      name: "Pin dự phòng Xiaomi 1C1A 20000mAh 1C 22.5W tích hợp cáp Type-C-Xám đậm", 
      price: 590000, 
      oldPrice: 690000,
      qty: 1, 
      img: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200&q=80&auto=format&fit=crop",
      weight: 250,
      height: 5,
      length: 16,
      width: 8
    }
  ];

  const totalWeight = cartItems.reduce((acc, item) => acc + (item.weight * item.qty), 0);
  const totalHeight = cartItems.reduce((acc, item) => acc + (item.height * item.qty), 0);
  const maxLength = Math.max(...cartItems.map(item => item.length), 10);
  const maxWidth = Math.max(...cartItems.map(item => item.width), 10);
  const insuranceValue = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const [shippingFee, setShippingFee] = useState(0);
  const [insuranceFee, setInsuranceFee] = useState(0);
  
  useEffect(() => {
    if (selectedDistrict && selectedWard) {
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
          insurance_value: insuranceValue > 5000000 ? 5000000 : insuranceValue,
          cod_failed_amount: 2000,
          coupon: null
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setShippingFee(data.data.service_fee || 0);
          setInsuranceFee(data.data.insurance_fee || 0);
        } else {
          setShippingFee(0);
          setInsuranceFee(0);
        }
      })
      .catch(error => {
        console.error("Fee API error:", error);
        setShippingFee(0);
        setInsuranceFee(0);
      });
    } else {
      setShippingFee(0);
      setInsuranceFee(0);
    }
  }, [selectedDistrict, selectedWard, shippingMethod, totalHeight, maxLength, totalWeight, maxWidth, insuranceValue]);

  const rawTotal = subtotal + shippingFee + insuranceFee;
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

  useEffect(() => {
    if (finalTotal === 0 && useWallet) {
      setPaymentMethod('wallet');
    } else if (paymentMethod === 'wallet' && finalTotal > 0) {
      setPaymentMethod('vnpay');
    }
  }, [finalTotal, useWallet, paymentMethod]);


  const validateAndGoToStep2 = () => {
    if (!email || email.trim() === '') {
      setAlertMessage("Quý khách vui lòng nhập Email.");
      return;
    }
    if (!selectedProvince) {
      setAlertMessage("Quý khách vui lòng chọn Tỉnh/Thành phố.");
      return;
    }
    if (!selectedDistrict) {
      setAlertMessage("Quý khách vui lòng chọn Quận/Huyện.");
      return;
    }
    if (!selectedWard) {
      setAlertMessage("Quý khách vui lòng chọn Phường/Xã.");
      return;
    }
    if (!detailAddress || detailAddress.trim() === '') {
      setAlertMessage("Quý khách vui lòng nhập Số nhà, tên đường.");
      return;
    }
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleContinue = () => {
    if (step === 1) {
      validateAndGoToStep2();
    } else {
      handlePlaceOrder();
    }
  };

  return (
    <>
      <style>{checkoutStyles}</style>
      <div className="cps-checkout-page">
        <AnimatePresence>
          {alertMessage && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)' }} 
                onClick={() => setAlertMessage(null)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                style={{ position: 'relative', width: '90%', maxWidth: '360px', background: '#fff', borderRadius: '4px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
              >
                <div style={{ background: '#f3f4f6', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#333' }}>Thông báo</div>
                  <div onClick={() => setAlertMessage(null)} style={{ cursor: 'pointer', color: '#6b7280', fontSize: '20px', lineHeight: 1, fontWeight: 'bold' }}>&times;</div>
                </div>
                <div style={{ padding: '20px 16px', fontSize: '14px', color: '#333' }}>
                  {alertMessage}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showPaymentModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)' }} 
                onClick={() => setShowPaymentModal(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                style={{ position: 'relative', width: '90%', maxWidth: '500px', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', maxHeight: '85vh' }}
              >
                <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111' }}>Chọn phương thức thanh toán</div>
                  <div onClick={() => setShowPaymentModal(false)} style={{ cursor: 'pointer', color: '#111', fontSize: '24px', lineHeight: 1 }}>&times;</div>
                </div>
                
                <div style={{ padding: '16px 20px', overflowY: 'auto' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', marginBottom: '12px' }}>KHẢ DỤNG</div>
                  
                  {walletData && (
                    <div 
                      className={`cps-payment-option ${useWallet ? 'active' : ''}`}
                      onClick={() => setUseWallet(!useWallet)}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div className="cps-payment-text">Ví điện tử Sprylo</div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                          Số dư: <span style={{ color: PRIMARY_COLOR, fontWeight: 600 }}>{walletBalance.toLocaleString('vi-VN')}đ</span>
                        </div>
                      </div>
                      <input type="checkbox" checked={useWallet} readOnly />
                    </div>
                  )}

                  <div 
                    className={`cps-payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('cod')}
                    style={{ opacity: finalTotal === 0 ? 0.5 : 1, pointerEvents: finalTotal === 0 ? 'none' : 'auto' }}
                  >
                    <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', flexShrink: 0, marginRight: '12px' }}>COD</div>
                    <div className="cps-payment-text" style={{ flex: 1 }}>Thanh toán khi nhận hàng</div>
                    <div className="cps-radio-custom" style={{ borderColor: paymentMethod === 'cod' ? '#d70018' : '#9ca3af', borderWidth: paymentMethod === 'cod' ? '5px' : '1px' }}></div>
                  </div>

                  <div 
                    className={`cps-payment-option ${paymentMethod === 'vnpay' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('vnpay')}
                    style={{ opacity: finalTotal === 0 ? 0.5 : 1, pointerEvents: finalTotal === 0 ? 'none' : 'auto' }}
                  >
                    <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418189687.png" alt="VNPay" className="cps-payment-icon" />
                    <div className="cps-payment-text" style={{ flex: 1 }}>Thanh toán qua VNPAY</div>
                    <div className="cps-radio-custom" style={{ borderColor: paymentMethod === 'vnpay' ? '#d70018' : '#9ca3af', borderWidth: paymentMethod === 'vnpay' ? '5px' : '1px' }}></div>
                  </div>
                  
                  <div 
                    className={`cps-payment-option ${paymentMethod === 'momo' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('momo')}
                    style={{ opacity: finalTotal === 0 ? 0.5 : 1, pointerEvents: finalTotal === 0 ? 'none' : 'auto' }}
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" className="cps-payment-icon" />
                    <div className="cps-payment-text" style={{ flex: 1 }}>Thanh toán qua Ví MoMo</div>
                    <div className="cps-radio-custom" style={{ borderColor: paymentMethod === 'momo' ? '#d70018' : '#9ca3af', borderWidth: paymentMethod === 'momo' ? '5px' : '1px' }}></div>
                  </div>

                  <div 
                    className={`cps-payment-option ${paymentMethod === 'zalopay' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('zalopay')}
                    style={{ opacity: finalTotal === 0 ? 0.5 : 1, pointerEvents: finalTotal === 0 ? 'none' : 'auto', marginBottom: 0 }}
                  >
                    <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png" alt="ZaloPay" className="cps-payment-icon" />
                    <div className="cps-payment-text" style={{ flex: 1 }}>Thanh toán qua ZaloPay</div>
                    <div className="cps-radio-custom" style={{ borderColor: paymentMethod === 'zalopay' ? '#d70018' : '#9ca3af', borderWidth: paymentMethod === 'zalopay' ? '5px' : '1px' }}></div>
                  </div>
                </div>
                
                <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb' }}>
                  <button onClick={() => setShowPaymentModal(false)} style={{ width: '100%', padding: '12px', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>Xác nhận</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        
        <div className="cps-container">
          
          <div className="cps-header">
            <div className="cps-back-btn" onClick={() => step === 2 ? setStep(1) : navigate('/cart')}>
              <ArrowLeft size={20} style={{ marginRight: '4px' }} />
            </div>
            <h1 className="cps-title">Thông tin</h1>
          </div>

          <div className="cps-step-tabs">
            <div className={`cps-step-tab ${step === 1 ? 'active' : ''}`} onClick={() => setStep(1)}>
              1. THÔNG TIN
            </div>
            <div className={`cps-step-tab ${step === 2 ? 'active' : ''}`} onClick={() => {
              if (step === 1) validateAndGoToStep2();
            }}>
              2. THANH TOÁN
            </div>
          </div>

          {step === 1 && (
            <>
              {/* Box 1: Product List */}
              <div className="cps-box">
                {cartItems.map(item => (
                  <div key={item.id} className="cps-product-item">
                    <img src={item.img} alt={item.name} className="cps-product-img" />
                    <div className="cps-product-info">
                      <div className="cps-product-name">{item.name}</div>
                      <div className="cps-product-meta">
                        <div>
                          <span className="cps-price">{item.price.toLocaleString('vi-VN')}đ</span>
                          {item.oldPrice && <span className="cps-old-price">{item.oldPrice.toLocaleString('vi-VN')}đ</span>}
                        </div>
                        <span className="cps-qty">Số lượng: {item.qty}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Box 2: Customer Info */}
              <div className="cps-section-title">THÔNG TIN KHÁCH HÀNG</div>
              <div className="cps-box">
                <div className="cps-customer-header">
                  <div className="cps-customer-name">
                    {fullName} <span className="cps-tag">S-NULL</span>
                  </div>
                  <div className="cps-customer-phone">{phoneNumber}</div>
                </div>
                
                <div className="cps-modern-input-group">
                  <label className="cps-modern-label">EMAIL <span style={{ color: '#d70018' }}>*</span></label>
                  <input 
                    type="email" 
                    className="cps-modern-input" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="cps-note" style={{ marginTop: '-8px' }}>(*) Hóa đơn VAT sẽ được gửi qua email này</div>
                
                <label className="cps-checkbox-wrap">
                  <input type="checkbox" defaultChecked />
                  <span>Nhận email thông báo và ưu đãi từ CellphoneS</span>
                </label>
              </div>

              {/* Box 3: Shipping Info */}
              <div className="cps-section-title">THÔNG TIN NHẬN HÀNG</div>
              <div className="cps-box">
                <div className="cps-modern-grid-2">
                  <div className="cps-modern-input-group">
                    <label className="cps-modern-label">TỈNH / THÀNH PHỐ <span style={{ color: '#d70018' }}>*</span></label>
                    <CustomSelect 
                      value={selectedProvince}
                      onChange={setSelectedProvince}
                      placeholder="Chọn Tỉnh/Thành"
                      options={provinces.map(p => ({value: p.id, label: p.name}))}
                    />
                    <ChevronDown size={14} className="cps-select-arrow" />
                  </div>
                  <div className="cps-modern-input-group">
                    <label className="cps-modern-label">QUẬN / HUYỆN <span style={{ color: '#d70018' }}>*</span></label>
                    <CustomSelect 
                      value={selectedDistrict}
                      onChange={setSelectedDistrict}
                      disabled={!selectedProvince}
                      placeholder="Chọn quận/huyện"
                      options={districts.map(d => ({value: d.id, label: d.name}))}
                    />
                    <ChevronDown size={14} className="cps-select-arrow" />
                  </div>
                </div>
                
                <div className="cps-modern-input-group">
                  <label className="cps-modern-label">PHƯỜNG / XÃ <span style={{ color: '#d70018' }}>*</span></label>
                  <CustomSelect 
                    value={selectedWard}
                    onChange={setSelectedWard}
                    disabled={!selectedDistrict}
                    placeholder="Chọn phường/xã"
                    options={wards.map(w => ({value: w.id, label: w.name}))}
                  />
                  <ChevronDown size={14} className="cps-select-arrow" />
                </div>

                <div className="cps-modern-input-group">
                  <label className="cps-modern-label">ĐỊA CHỈ <span style={{ color: '#d70018' }}>*</span></label>
                  <input 
                    type="text" 
                    className="cps-modern-input" 
                    placeholder="Số nhà, tên đường..."
                    value={detailAddress}
                    onChange={(e) => setDetailAddress(e.target.value)}
                  />
                </div>
                
                <div className="cps-modern-input-group" style={{ marginBottom: 0, borderBottom: 'none' }}>
                  <input 
                    type="text" 
                    className="cps-modern-input" 
                    placeholder="Ghi chú khác (nếu có)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </div>

              {/* Shipping Methods inside step 1 if we need them, or leave it for step 2? Image doesn't show it but we need it. Let's put it here */}
              <div className="cps-section-title">ĐƠN VỊ VẬN CHUYỂN</div>
              <div className="cps-box">
                <div 
                  className={`cps-shipping-method-box ${shippingMethod === 'ghn' ? 'active' : ''}`}
                  onClick={() => setShippingMethod('ghn')}
                >
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '14px', marginBottom: '4px' }}>Giao Hàng Nhanh</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Tốc hành 1-2 ngày</div>
                  </div>
                  <div style={{ fontWeight: 600, color: PRIMARY_COLOR }}>
                    {(shippingFee + insuranceFee) > 0 ? `${(shippingFee + insuranceFee).toLocaleString('vi-VN')}đ` : 'Chưa tính'}
                  </div>
                </div>
                <div 
                  className={`cps-shipping-method-box ${shippingMethod === 'ghtk' ? 'active' : ''}`}
                  onClick={() => setShippingMethod('ghtk')}
                  style={{ marginBottom: 0 }}
                >
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '14px', marginBottom: '4px' }}>Giao Hàng Tiết Kiệm</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Tiêu chuẩn 3-4 ngày</div>
                  </div>
                  <div style={{ fontWeight: 600, color: PRIMARY_COLOR }}>
                    {(shippingFee + insuranceFee) > 0 ? `${(shippingFee + insuranceFee).toLocaleString('vi-VN')}đ` : 'Chưa tính'}
                  </div>
                </div>
              </div>


              {/* Box 4: Invoice */}
              <div className="cps-invoice-block">
                <span>Quý khách có muốn xuất hóa đơn công ty không?</span>
                <div className="cps-radio-group">
                  <label className="cps-radio-item">
                    <input type="radio" name="invoice" checked={wantInvoice} onChange={() => setWantInvoice(true)} /> Có
                  </label>
                  <label className="cps-radio-item">
                    <input type="radio" name="invoice" checked={!wantInvoice} onChange={() => setWantInvoice(false)} /> Không
                  </label>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Summary in Step 2 */}
              <div className="cps-box">
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <input type="text" className="cps-modern-input" placeholder="Nhập mã giảm giá (chỉ áp dụng 1 lần)" style={{ border: '1px solid #e5e7eb', borderRadius: '4px', padding: '8px 12px' }} />
                  <button style={{ background: '#f3f4f6', border: 'none', borderRadius: '4px', padding: '0 16px', color: '#9ca3af', fontWeight: 500, whiteSpace: 'nowrap' }}>Áp dụng</button>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#4b5563' }}>
                  <span>Số lượng sản phẩm</span>
                  <span style={{ fontWeight: 600, color: '#111' }}>0{cartItems.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#4b5563' }}>
                  <span>Tổng tiền hàng</span>
                  <span style={{ fontWeight: 600, color: '#111' }}>{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px', color: '#4b5563' }}>
                  <span>Phí vận chuyển</span>
                  <span style={{ fontWeight: 600, color: '#111' }}>{(shippingFee + insuranceFee) > 0 ? `${(shippingFee + insuranceFee).toLocaleString('vi-VN')}đ` : 'Miễn phí'}</span>
                </div>
                
                {useWallet && walletDeducted > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px', color: '#4b5563' }}>
                    <span>Giảm giá trực tiếp (Ví)</span>
                    <span style={{ fontWeight: 600, color: '#d70018' }}>- {walletDeducted.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#111', fontSize: '15px' }}>Tổng tiền</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>Đã gồm VAT và được làm tròn</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: '#111' }}>{finalTotal.toLocaleString('vi-VN')}đ</div>
                </div>
              </div>

              <div className="cps-section-title">THÔNG TIN THANH TOÁN</div>
              
              <div className="cps-box" style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '12px', cursor: 'pointer', marginBottom: '16px' }} onClick={() => setShowPaymentModal(true)}>
                <div style={{ width: '40px', height: '40px', background: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                  💳
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#d70018', fontSize: '15px', fontWeight: 500 }}>Chọn phương thức thanh toán</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{useWallet ? 'Ví Sprylo' : getPaymentLabel(paymentMethod)}</div>
                </div>
                <ChevronRight size={18} color="#d70018" />
              </div>

              <div className="cps-section-title">THÔNG TIN NHẬN HÀNG</div>
              <div className="cps-box" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', marginBottom: '12px', fontSize: '14px' }}>
                  <span style={{ width: '120px', color: '#6b7280' }}>Khách hàng</span>
                  <span style={{ flex: 1, textAlign: 'right', color: '#111' }}><span className="cps-tag">S-NULL</span> {fullName}</span>
                </div>
                <div style={{ display: 'flex', marginBottom: '12px', fontSize: '14px' }}>
                  <span style={{ width: '120px', color: '#6b7280' }}>Số điện thoại</span>
                  <span style={{ flex: 1, textAlign: 'right', color: '#111' }}>{phoneNumber}</span>
                </div>
                <div style={{ display: 'flex', marginBottom: '12px', fontSize: '14px' }}>
                  <span style={{ width: '120px', color: '#6b7280' }}>Email</span>
                  <span style={{ flex: 1, textAlign: 'right', color: '#111' }}>{email}</span>
                </div>
                <div style={{ display: 'flex', marginBottom: '12px', fontSize: '14px' }}>
                  <span style={{ width: '120px', color: '#6b7280' }}>Nhận hàng tại</span>
                  <span style={{ flex: 1, textAlign: 'right', color: '#111', lineHeight: '1.4' }}>{mergedAddress}</span>
                </div>
                <div style={{ display: 'flex', fontSize: '14px' }}>
                  <span style={{ width: '120px', color: '#6b7280' }}>Người nhận</span>
                  <span style={{ flex: 1, textAlign: 'right', color: '#111' }}>{fullName} - {phoneNumber}</span>
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', marginTop: '16px', color: '#333' }}>
                <input type="checkbox" defaultChecked style={{ marginTop: '4px', accentColor: '#d70018' }} />
                <div>
                  Bằng việc Đặt hàng, bạn đồng ý với <span style={{ color: '#2563eb' }}>Điều khoản sử dụng</span> của CellphoneS.<br/>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>Với các giao dịch <strong>từ 10 triệu trở lên</strong>, CellphoneS xin phép kiểm tra <strong>thẻ cứng</strong> và <strong>CCCD</strong>...</span>
                </div>
              </label>
              
              <div style={{ height: '24px' }}></div>
            </>
          )}

        </div>

        <div className="cps-bottom-bar">
          <div className="cps-bottom-content">
            <div className="cps-total-row" style={{ marginBottom: '8px' }}>
              <div style={{ fontWeight: 600, color: '#111', fontSize: '15px' }}>Tổng tiền tạm tính:</div>
              <div style={{ color: '#d70018', fontWeight: 700, fontSize: '16px' }}>{finalTotal.toLocaleString('vi-VN')}đ</div>
            </div>
            <button className="cps-btn-primary" style={{ background: '#d70018' }} onClick={handleContinue}>
              {step === 1 ? 'Tiếp tục' : 'Thanh toán'}
            </button>
            {step === 2 && (
              <div style={{ textAlign: 'center', fontSize: '13px', color: '#2563eb', marginTop: '8px', cursor: 'pointer' }}>
                Kiểm tra danh sách sản phẩm ({cartItems.length})
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
