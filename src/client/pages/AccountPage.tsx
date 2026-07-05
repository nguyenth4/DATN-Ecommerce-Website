import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import '../styles/account.css';
import '../styles/order-tracking.css';
import { 
  Camera, 
  User, 
  Receipt, 
  MapPin, 
  Heart, 
  Lock, 
  LogOut, 
  CheckCircle, 
  Check,
  Wallet
} from 'lucide-react';
import { useProducts } from '../services/product.service';
import { walletService } from '../services/wallet.service';
import { getWishlist } from '../utils/wishlist';
import ProductCard from '../components/ProductCard';

// Mock Orders Data
const MOCK_ORDERS = [
  {
    id: 'SF2025-8843',
    date: '24/05/2025 – 09:32',
    total: 38015000,
    paymentStatus: 'Đã thanh toán',
    paymentMethod: 'Thẻ tín dụng (Visa/Mastercard)',
    shippingStatus: 'Đang giao',
    shippingAddress: {
      name: 'Trần Ngọc',
      phone: '0912 345 678',
      address: 'Số 123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh'
    },
    items: [
      {
        name: 'Sony WH-1000XM5',
        variant: 'Đen',
        quantity: 1,
        price: 8490000,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&q=80'
      },
      {
        name: 'iPhone 15 Pro Max 256GB',
        variant: 'Titan Tự Nhiên',
        quantity: 1,
        price: 29525000,
        image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=120&q=80'
      }
    ],
    timeline: [
      { time: '25/05/2025 – 10:45', desc: 'Đang trên đường giao hàng', sub: 'Nhân viên: Nguyễn Văn Tài – 0901 234 567', current: true },
      { time: '25/05/2025 – 08:20', desc: 'Đã rời kho phân phối – TP.HCM', sub: 'Bưu cục: GHN Quận 1', done: true },
      { time: '24/05/2025 – 14:30', desc: 'Đang đóng gói hàng hóa', sub: 'Nhân viên kho: Lê Văn B', done: true },
      { time: '24/05/2025 – 10:15', desc: 'Đơn hàng đã được xác nhận', sub: 'Thanh toán trực tuyến thành công', done: true },
      { time: '24/05/2025 – 09:32', desc: 'Đặt hàng thành công', sub: 'Mã giao dịch: #TXN-778932', done: true }
    ],
    statusStep: 3 // Ordered: 0, Confirmed: 1, Packing: 2, Shipping: 3, Delivered: 4
  },
  {
    id: 'SF2025-4421',
    date: '18/04/2025 – 14:15',
    total: 3490000,
    paymentStatus: 'Đã thanh toán',
    paymentMethod: 'Ví MoMo',
    shippingStatus: 'Đã nhận',
    shippingAddress: {
      name: 'Trần Ngọc',
      phone: '0912 345 678',
      address: 'Số 123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh'
    },
    items: [
      {
        name: 'Bàn phím cơ Keychron K8 Pro',
        variant: 'RGB Red Switch',
        quantity: 1,
        price: 3490000,
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=120&q=80'
      }
    ],
    timeline: [
      { time: '20/04/2025 – 15:30', desc: 'Đã giao hàng thành công', sub: 'Người nhận: Trần Ngọc', done: true },
      { time: '20/04/2025 – 09:15', desc: 'Đang giao hàng', sub: 'Nhân viên: Nguyễn Văn Tài', done: true },
      { time: '19/04/2025 – 11:20', desc: 'Đã rời kho phân phối', sub: 'Bưu cục: GHN Quận 1', done: true },
      { time: '18/04/2025 – 15:40', desc: 'Đã hoàn tất đóng gói', sub: 'Nhân viên kho', done: true },
      { time: '18/04/2025 – 14:15', desc: 'Đặt hàng thành công', sub: 'Mã giao dịch: #TXN-665243', done: true }
    ],
    statusStep: 4
  },
  {
    id: 'SF2025-1102',
    date: '02/03/2025 – 18:22',
    total: 12500000,
    paymentStatus: 'Chưa thanh toán',
    paymentMethod: 'Thanh toán khi nhận hàng (COD)',
    shippingStatus: 'Đã hủy',
    shippingAddress: {
      name: 'Trần Ngọc',
      phone: '0912 345 678',
      address: 'Số 123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh'
    },
    items: [
      {
        name: 'Màn hình Dell UltraSharp U2422H 24" IPS',
        variant: 'Đen',
        quantity: 2,
        price: 6250000,
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=120&q=80'
      }
    ],
    timeline: [
      { time: '03/03/2025 – 10:00', desc: 'Đã hủy đơn hàng', sub: 'Lý do: Khách hàng yêu cầu hủy đơn', done: true }
    ],
    statusStep: -1
  }
];

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses' | 'wishlist' | 'wallet' | 'password' | 'policies'>('profile');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [walletData, setWalletData] = useState<any>(null);

  useEffect(() => {
    if (activeTab === 'wallet') {
      walletService.getWallet('cus_demo_123')
        .then(res => setWalletData(res.wallet))
        .catch(console.error);
    }
  }, [activeTab]);
  
  const [wishlistIds, setWishlistIds] = useState<string[]>(getWishlist());

  // Listen to wishlist updates to sync state
  useEffect(() => {
    const handleUpdate = () => {
      setWishlistIds(getWishlist());
    };
    window.addEventListener('wishlist-updated', handleUpdate);
    return () => {
      window.removeEventListener('wishlist-updated', handleUpdate);
    };
  }, []);

  // Fetch product data from Medusa/fallback mock data for wishlist items
  const { data: productsData, isLoading: isWishlistLoading } = useProducts(
    wishlistIds.length > 0 ? { id: wishlistIds, limit: 10 } : undefined
  );

  const wishlistProducts = useMemo(() => {
    if (wishlistIds.length === 0 || !productsData?.products) return [];
    return wishlistIds
      .map(id => productsData.products.find((p: any) => p.id === id))
      .filter(Boolean);
  }, [productsData, wishlistIds]);

  // Profile form state
  const [firstName, setFirstName] = useState('Trần');
  const [lastName, setLastName] = useState('Ngọc');
  const [email, setEmail] = useState('tran.ngoc@email.com');
  const [phone, setPhone] = useState('0912 345 678');
  const [gender, setGender] = useState('Nam');
  const [dob, setDob] = useState('1998-05-15');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCancelProfile = () => {
    setFirstName('Trần');
    setLastName('Ngọc');
    setEmail('tran.ngoc@email.com');
    setPhone('0912 345 678');
    setGender('Nam');
    setDob('1998-05-15');
  };

  const selectedOrder = MOCK_ORDERS.find(o => o.id === selectedOrderId);

  const getShippingBadgeClass = (status: string) => {
    switch (status) {
      case 'Đang giao': return 'status-badge badge-shipped';
      case 'Đã nhận': return 'status-badge badge-completed';
      case 'Đã hủy': return 'status-badge badge-cancelled';
      default: return 'status-badge badge-pending';
    }
  };

  const getShippingBadgeIcon = (status: string) => {
    switch (status) {
      case 'Đang giao': return 'bi bi-truck';
      case 'Đã nhận': return 'bi bi-check-circle-fill';
      case 'Đã hủy': return 'bi bi-x-circle-fill';
      default: return 'bi bi-clock-history';
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <>
      <div className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Trang chủ</Link><span>/</span><span>Tài khoản</span>
          </div>
          <h1>TÀI KHOẢN CỦA TÔI</h1>
        </div>
      </div>

      <section className="section products-section-bg">
        <div className="container">
          <div className="account-layout">
            
            {/* SIDEBAR */}
            <div className="account-sidebar">
              <div className="account-profile-header">
                <div className="avatar-wrap">
                  <div className="avatar-img">{firstName.charAt(0)}{lastName.charAt(0)}</div>
                  <div className="avatar-edit"><Camera size={14} /></div>
                </div>
                <div className="account-name">{firstName} {lastName}</div>
                <div className="account-email">{email}</div>
              </div>
              <div style={{ padding: '0.5rem 0' }}>
                <div 
                  className={`account-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('profile'); setSelectedOrderId(null); }}
                >
                  <User size={18} style={{marginRight: '12px'}}/> Thông tin cá nhân
                </div>
                <div 
                  className={`account-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('orders'); setSelectedOrderId(null); }}
                >
                  <Receipt size={18} style={{marginRight: '12px'}}/> Đơn hàng của tôi
                  <span className="badge-count" style={{ marginLeft: 'auto', position: 'static', background: 'var(--indigo)', color: 'white', padding: '1px 6px', borderRadius: '10px', fontSize: '0.68rem' }}>
                    {MOCK_ORDERS.length}
                  </span>
                </div>
                <div 
                  className={`account-nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('addresses'); setSelectedOrderId(null); }}
                >
                  <MapPin size={18} style={{marginRight: '12px'}}/> Địa chỉ giao hàng
                </div>
                <div 
                  className={`account-nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('wishlist'); setSelectedOrderId(null); }}
                >
                  <Heart size={18} style={{marginRight: '12px'}}/> Sản phẩm yêu thích
                </div>
                <div 
                  className={`account-nav-item ${activeTab === 'wallet' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('wallet'); setSelectedOrderId(null); }}
                >
                  <Wallet size={18} style={{marginRight: '12px'}}/> Ví điện tử Sprylo
                </div>
                <div 
                  className={`account-nav-item ${activeTab === 'password' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('password'); setSelectedOrderId(null); }}
                >
                  <Lock size={18} style={{marginRight: '12px'}}/> Đổi mật khẩu
                </div>
                <div 
                  className={`account-nav-item ${activeTab === 'policies' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('policies'); setSelectedOrderId(null); }}
                >
                  <CheckCircle size={18} style={{marginRight: '12px'}}/> Quản lý chính sách (Seller)
                </div>
                <div className="account-nav-divider"></div>
                <Link to="/login" className="account-nav-item text-danger">
                  <LogOut size={18} style={{marginRight: '12px'}}/> Đăng xuất
                </Link>
              </div>
            </div>


            {/* CONTENT */}
            <div style={{ flex: 1 }}>
              
              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <div className="tab-panel active">
                  <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--rule)', padding: '1.8rem', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ fontFamily: "var(--ff-display)", fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--rule)' }}>
                      Thông tin cá nhân
                    </div>
                    
                    {saveSuccess && (
                      <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
                        <CheckCircle size={16} /> Cập nhật thông tin cá nhân thành công!
                      </div>
                    )}
                    
                    <div className="alert alert-info" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={16} /> Tài khoản đã xác thực email
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Họ *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={firstName} 
                          onChange={(e) => setFirstName(e.target.value)} 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Tên *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={lastName} 
                          onChange={(e) => setLastName(e.target.value)} 
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email *</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Số điện thoại</label>
                        <input 
                          type="tel" 
                          className="form-control" 
                          value={phone} 
                          onChange={(e) => setPhone(e.target.value)} 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Giới tính</label>
                        <select 
                          className="form-control" 
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                        >
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                          <option value="Khác">Khác</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Ngày sinh</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={dob} 
                        onChange={(e) => setDob(e.target.value)} 
                      />
                    </div>
                    <div className="flex-center" style={{ justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1.8rem' }}>
                      <button className="btn btn--ghost" onClick={handleCancelProfile}>Hủy thay đổi</button>
                      <button className="btn btn--indigo" onClick={handleSaveProfile} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Check size={18} /> Lưu thay đổi
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* ORDERS TAB */}
              {activeTab === 'orders' && (
                <div className="tab-panel active">
                  {!selectedOrderId ? (
                    // Orders List View
                    <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--rule)', padding: '1.8rem', boxShadow: 'var(--shadow-sm)' }}>
                      <div style={{ fontFamily: "var(--ff-display)", fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--rule)' }}>
                        Đơn hàng của tôi
                      </div>
                      
                      <div style={{ overflowX: 'auto' }}>
                        <table className="orders-table">
                          <thead>
                            <tr>
                              <th>Mã đơn hàng</th>
                              <th>Ngày đặt</th>
                              <th>Tổng cộng</th>
                              <th>Thanh toán</th>
                              <th>Vận chuyển</th>
                              <th style={{ textAlign: 'right' }}>Hành động</th>
                            </tr>
                          </thead>
                          <tbody>
                            {MOCK_ORDERS.map((order) => (
                              <tr key={order.id}>
                                <td style={{ fontWeight: 700, color: 'var(--ink)' }}>{order.id}</td>
                                <td>{order.date.split(' – ')[0]}</td>
                                <td style={{ fontWeight: 700, color: 'var(--indigo)' }}>{formatPrice(order.total)}</td>
                                <td>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{order.paymentStatus}</span>
                                </td>
                                <td>
                                  <span className={getShippingBadgeClass(order.shippingStatus)}>
                                    <i className={getShippingBadgeIcon(order.shippingStatus)}></i> {order.shippingStatus}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                  <button 
                                    className="btn btn--sm btn--indigo" 
                                    onClick={() => setSelectedOrderId(order.id)}
                                  >
                                    Chi tiết
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    // Order Details View
                    selectedOrder && (
                      <div className="order-details-card">
                        <button className="btn-back" onClick={() => setSelectedOrderId(null)}>
                          <i className="bi bi-arrow-left"></i> Trở lại danh sách đơn hàng
                        </button>
                        
                        <div className="order-details-header">
                          <div>
                            <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: '1.5rem', fontWeight: 800 }}>
                              Chi tiết đơn hàng {selectedOrder.id}
                            </h2>
                            <p className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>
                              Đặt lúc {selectedOrder.date}
                            </p>
                          </div>
                          <span className={getShippingBadgeClass(selectedOrder.shippingStatus)} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                            <i className={getShippingBadgeIcon(selectedOrder.shippingStatus)}></i> {selectedOrder.shippingStatus}
                          </span>
                        </div>

                        {/* STEPPER PROGRESS */}
                        {selectedOrder.statusStep >= 0 && (
                          <div style={{ background: 'var(--bg)', borderRadius: 'var(--r)', padding: '1.5rem 1rem', marginBottom: '1.5rem', border: '1px solid var(--rule)' }}>
                            <div className="tracking-steps">
                              <div className={`tracking-step ${selectedOrder.statusStep >= 0 ? 'done' : ''} ${selectedOrder.statusStep === 0 ? 'current' : ''}`}>
                                <div className="step-icon">
                                  {selectedOrder.statusStep > 0 ? <i className="bi bi-check2"></i> : <i className="bi bi-receipt"></i>}
                                </div>
                                <div className="step-label">Đã đặt</div>
                              </div>
                              <div className={`tracking-step ${selectedOrder.statusStep >= 1 ? 'done' : ''} ${selectedOrder.statusStep === 1 ? 'current' : ''}`}>
                                <div className="step-icon">
                                  {selectedOrder.statusStep > 1 ? <i className="bi bi-check2"></i> : <i className="bi bi-patch-check"></i>}
                                </div>
                                <div className="step-label">Xác nhận</div>
                              </div>
                              <div className={`tracking-step ${selectedOrder.statusStep >= 2 ? 'done' : ''} ${selectedOrder.statusStep === 2 ? 'current' : ''}`}>
                                <div className="step-icon">
                                  {selectedOrder.statusStep > 2 ? <i className="bi bi-check2"></i> : <i className="bi bi-box-seam"></i>}
                                </div>
                                <div className="step-label">Đóng gói</div>
                              </div>
                              <div className={`tracking-step ${selectedOrder.statusStep >= 3 ? 'done' : ''} ${selectedOrder.statusStep === 3 ? 'current' : ''}`}>
                                <div className="step-icon">
                                  {selectedOrder.statusStep > 3 ? <i className="bi bi-check2"></i> : <i className="bi bi-truck"></i>}
                                </div>
                                <div className="step-label">Đang giao</div>
                              </div>
                              <div className={`tracking-step ${selectedOrder.statusStep >= 4 ? 'done' : ''} ${selectedOrder.statusStep === 4 ? 'current' : ''}`}>
                                <div className="step-icon">
                                  <i className="bi bi-house-check"></i>
                                </div>
                                <div className="step-label">Đã nhận</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* SHIPPING & PAYMENT INFO */}
                        <div className="order-details-grid">
                          <div className="info-card">
                            <div className="info-card-title">Địa chỉ nhận hàng</div>
                            <div className="info-card-text">
                              <strong style={{ display: 'block', marginBottom: '0.3rem', color: 'var(--ink)' }}>
                                {selectedOrder.shippingAddress.name}
                              </strong>
                              <span style={{ display: 'block', marginBottom: '0.2rem' }}>
                                <i className="bi bi-telephone text-muted" style={{ marginRight: '0.4rem' }}></i>
                                {selectedOrder.shippingAddress.phone}
                              </span>
                              <span>
                                <i className="bi bi-geo-alt text-muted" style={{ marginRight: '0.4rem' }}></i>
                                {selectedOrder.shippingAddress.address}
                              </span>
                            </div>
                          </div>
                          
                          <div className="info-card">
                            <div className="info-card-title">Phương thức thanh toán</div>
                            <div className="info-card-text">
                              <span style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem', color: 'var(--ink)' }}>
                                {selectedOrder.paymentMethod}
                              </span>
                              <div className="flex-center text-xs">
                                <span className={`status-badge ${selectedOrder.paymentStatus === 'Đã thanh toán' ? 'badge-completed' : 'badge-pending'}`} style={{ padding: '0.2rem 0.6rem' }}>
                                  {selectedOrder.paymentStatus}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ORDER ITEMS */}
                        <div style={{ fontFamily: 'var(--ff-display)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.8rem' }}>
                          Sản phẩm trong đơn hàng
                        </div>
                        <div className="order-items-list">
                          {selectedOrder.items.map((item, idx) => (
                            <div className="order-item-row" key={idx}>
                              <img src={item.image} alt={item.name} className="order-item-img" />
                              <div className="order-item-info">
                                <div className="order-item-name">{item.name}</div>
                                <div className="order-item-meta">Phân loại: {item.variant} &middot; Số lượng: {item.quantity}</div>
                              </div>
                              <div className="order-item-price">
                                {formatPrice(item.price)}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* SUMS */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1.5rem', marginTop: '1.5rem' }}>
                          
                          {/* TIMELINE MINI */}
                          <div style={{ flex: 1, minWidth: '280px' }}>
                            <div style={{ fontFamily: 'var(--ff-display)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.8rem' }}>
                              Lịch sử vận chuyển
                            </div>
                            <div className="timeline" style={{ background: 'white', padding: '1rem', border: '1px solid var(--rule)', borderRadius: 'var(--r)' }}>
                              {selectedOrder.timeline.map((event, idx) => (
                                <div className="timeline-item" key={idx}>
                                  <div className={`timeline-dot ${event.current ? 'current' : ''} ${event.done ? 'done' : ''}`}>
                                    {event.current ? <i className="bi bi-truck"></i> : <i className="bi bi-check"></i>}
                                  </div>
                                  <div className="timeline-time">{event.time}</div>
                                  <div className="timeline-desc">{event.desc}</div>
                                  {event.sub && <div className="timeline-sub">{event.sub}</div>}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* TOTALS */}
                          <div className="order-totals-card" style={{ minWidth: '280px' }}>
                            <div className="total-row">
                              <span className="text-muted">Tạm tính:</span>
                              <span style={{ fontWeight: 600 }}>{formatPrice(selectedOrder.total - 30000)}</span>
                            </div>
                            <div className="total-row">
                              <span className="text-muted">Phí vận chuyển:</span>
                              <span style={{ fontWeight: 600 }}>{formatPrice(30000)}</span>
                            </div>
                            <div className="total-row">
                              <span className="text-muted">Giảm giá:</span>
                              <span style={{ fontWeight: 600, color: 'var(--emerald)' }}>{formatPrice(0)}</span>
                            </div>
                            <div className="total-row grand-total">
                              <span>Tổng cộng:</span>
                              <span>{formatPrice(selectedOrder.total)}</span>
                            </div>
                          </div>
                          
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* ADDRESSES TAB */}
              {activeTab === 'addresses' && (
                <div className="tab-panel active">
                  <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--rule)', padding: '1.8rem', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ fontFamily: "var(--ff-display)", fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--rule)' }}>
                      Địa chỉ giao hàng
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
                      <div className="address-card default">
                        <div style={{ position: 'absolute', top: '1.2rem', right: '1.2rem' }}>
                          <span className="status-badge badge-completed" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>Mặc định</span>
                        </div>
                        <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem' }}>Nhà riêng</h4>
                        <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--fg-soft)' }}>
                          <strong>Trần Ngọc</strong><br />
                          0912 345 678<br />
                          Số 123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
                        </p>
                        <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem', borderTop: '1px solid var(--rule)', paddingTop: '0.8rem' }}>
                          <button style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--indigo)' }}><i className="bi bi-pencil"></i> Chỉnh sửa</button>
                          <button style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--fg-mute)', cursor: 'not-allowed' }} disabled><i className="bi bi-trash"></i> Xóa</button>
                        </div>
                      </div>
                      
                      <div className="address-card">
                        <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem' }}>Văn phòng</h4>
                        <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--fg-soft)' }}>
                          <strong>Trần Ngọc</strong><br />
                          0912 345 678<br />
                          Tầng 15, Tòa nhà Bitexco Financial, 2 Hải Triều, Bến Nghé, Quận 1, TP. Hồ Chí Minh
                        </p>
                        <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem', borderTop: '1px solid var(--rule)', paddingTop: '0.8rem' }}>
                          <button style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--indigo)' }}><i className="bi bi-pencil"></i> Chỉnh sửa</button>
                          <button style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--rose)' }}><i className="bi bi-trash"></i> Xóa</button>
                        </div>
                      </div>
                    </div>
                    <button className="btn btn--indigo" style={{ marginTop: '1.5rem' }}><i className="bi bi-plus-lg"></i> Thêm địa chỉ mới</button>
                  </div>
                </div>
              )}

              {/* WISHLIST TAB */}
              {activeTab === 'wishlist' && (
                <div className="tab-panel active">
                  <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--rule)', padding: '1.8rem', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ fontFamily: "var(--ff-display)", fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--rule)' }}>
                      Sản phẩm yêu thích ({wishlistIds.length})
                    </div>
                    
                    {isWishlistLoading ? (
                      <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--fg-mute)' }}>
                        <div style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid var(--indigo-line)', borderTopColor: 'var(--indigo)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }}></div>
                        <p style={{ margin: 0, fontSize: '0.85rem' }}>Đang tải...</p>
                      </div>
                    ) : wishlistProducts.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <div style={{ display: 'inline-flex', width: '60px', height: '60px', borderRadius: '50%', background: 'var(--rose-soft, #fff1f2)', alignItems: 'center', justifyContent: 'center', color: 'var(--rose)', marginBottom: '1rem' }}>
                          <Heart size={28} fill="var(--rose)" />
                        </div>
                        <p style={{ margin: '0 0 1rem 0', color: 'var(--fg-soft)', fontSize: '0.95rem' }}>Danh sách yêu thích của bạn đang trống</p>
                        <Link to="/products" className="btn btn-sm btn--indigo" style={{ padding: '0.5rem 1.25rem', borderRadius: '20px' }}>Mua sắm ngay</Link>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.2rem' }}>
                        {wishlistProducts.map(product => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* WALLET TAB */}
              {activeTab === 'wallet' && (
                <div className="tab-panel active">
                  <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--rule)', padding: '1.8rem', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ fontFamily: "var(--ff-display)", fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--rule)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      Ví điện tử Sprylo
                      <button className="btn btn-sm btn--ghost" onClick={() => walletService.topupMock(5000000, 'cus_demo_123').then(res => setWalletData(res.wallet))}>
                        Nạp 5.000.000đ (Demo)
                      </button>
                    </div>
                    
                    <div className="wallet-card-bg" style={{ background: 'linear-gradient(135deg, var(--indigo) 0%, var(--card-purple) 100%)', borderRadius: 'var(--r-lg)', padding: '2rem', color: 'white', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
                       <div style={{ position: 'relative', zIndex: 2 }}>
                         <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Số dư khả dụng</div>
                         <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--ff-display)' }}>
                           {walletData ? formatPrice(Number(walletData.balance)) : 'Đang tải...'}
                         </div>
                         <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                           <div>
                             <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Chủ tài khoản</div>
                             <div style={{ fontWeight: 600, letterSpacing: '1px' }}>{firstName.toUpperCase()} {lastName.toUpperCase()}</div>
                           </div>
                           <Wallet size={36} style={{ opacity: 0.5 }} />
                         </div>
                       </div>
                       <div style={{ position: 'absolute', right: '-10%', top: '-20%', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', zIndex: 1 }}></div>
                       <div style={{ position: 'absolute', right: '20%', bottom: '-30%', width: '150px', height: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', zIndex: 1 }}></div>
                    </div>

                    <h4 style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem' }}>Lịch sử giao dịch</h4>
                    
                    {walletData?.transactions?.length > 0 ? (
                      <div className="wallet-transactions">
                        {[...walletData.transactions].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((tx: any) => (
                          <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--rule)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: tx.type === 'payment' ? 'var(--rose-soft)' : 'var(--emerald-soft, #d1fae5)', color: tx.type === 'payment' ? 'var(--rose)' : 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {tx.type === 'payment' ? <Wallet size={18} /> : <CheckCircle size={18} />}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{tx.description || (tx.type === 'payment' ? 'Thanh toán đơn hàng' : 'Nạp tiền / Hoàn tiền')}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--fg-mute)' }}>{new Date(tx.created_at).toLocaleString('vi-VN')}</div>
                              </div>
                            </div>
                            <div style={{ fontWeight: 700, color: tx.type === 'payment' ? 'var(--ink)' : 'var(--emerald)' }}>
                              {tx.type === 'payment' ? '-' : '+'}{formatPrice(Number(tx.amount))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--fg-mute)', background: 'var(--bg-soft)', borderRadius: 'var(--r)' }}>
                        Chưa có giao dịch nào
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PASSWORD TAB */}
              {activeTab === 'password' && (
                <div className="tab-panel active">
                  <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--rule)', padding: '1.8rem', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ fontFamily: "var(--ff-display)", fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--rule)' }}>
                      Đổi mật khẩu
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mật khẩu hiện tại *</label>
                      <input type="password" className="form-control" placeholder="Nhập mật khẩu hiện tại..." />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mật khẩu mới *</label>
                      <input type="password" className="form-control" placeholder="Nhập mật khẩu mới..." />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Xác nhận mật khẩu mới *</label>
                      <input type="password" className="form-control" placeholder="Nhập lại mật khẩu mới..." />
                    </div>
                    <div className="flex-center" style={{ justifyContent: 'flex-end', marginTop: '1.8rem' }}>
                      <button className="btn btn--indigo"><i className="bi bi-shield-lock"></i> Cập nhật mật khẩu</button>
                    </div>
                  </div>
                </div>
              )}

              {/* POLICIES TAB (Seller) */}
              {activeTab === 'policies' && (
                <div id="tab-policies" className="tab-panel active">
                  <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--rule)', padding: '1.8rem', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ fontFamily: "var(--ff-display)", fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--rule)' }}>
                      Quản lý Chính sách Sản phẩm (Seller)
                    </div>
                    <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                      Thiết lập các chính sách bảo hành và đổi trả áp dụng cho các sản phẩm của bạn. Các thay đổi sẽ được hiển thị ngay trên trang chi tiết sản phẩm.
                    </p>

                    <div style={{ marginBottom: '2rem' }}>
                      <div className="form-group">
                        <label className="form-label">Chọn sản phẩm cần áp dụng:</label>
                        <select className="form-control" style={{ maxWidth: '400px' }}>
                          <option>— Áp dụng cho tất cả sản phẩm —</option>
                          <option>iPhone 15 Pro Max</option>
                          <option>Samsung Galaxy S24 Ultra</option>
                          <option>MacBook Pro M3</option>
                        </select>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Chính sách bảo hành</label>
                          <input type="text" className="form-control" placeholder="Ví dụ: BH 12 tháng chính hãng" defaultValue="BH 12 tháng chính hãng" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Chính sách đổi trả</label>
                          <input type="text" className="form-control" placeholder="Ví dụ: Đổi trả 30 ngày" defaultValue="Đổi trả 30 ngày" />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Chi tiết chính sách (Mô tả chi tiết)</label>
                        <textarea className="form-control" rows={4} defaultValue="Dòng sản phẩm chính hãng Apple Việt Nam. Đổi mới trong 30 ngày đầu nếu có lỗi phần cứng từ nhà sản xuất. Bảo hành 12 tháng tại các trung tâm bảo hành ủy quyền của Apple trên toàn quốc."></textarea>
                      </div>

                      <button className="btn btn--indigo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Check size={18} /> Cập nhật chính sách
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AccountPage;