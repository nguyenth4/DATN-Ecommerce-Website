import { Link } from 'react-router-dom';
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
  ChevronRight 
} from 'lucide-react';

const AccountPage = () => {
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
                  <div className="avatar-img">TN</div>
                  <div className="avatar-edit"><Camera size={14} /></div>
                </div>
                <div className="account-name">Trần Ngọc</div>
                <div className="account-email">tran.ngoc@email.com</div>
              </div>
              <div style={{ padding: '0.5rem 0' }}>
                <div className="account-nav-item active">
                  <User size={18} style={{marginRight: '12px'}}/> Thông tin cá nhân
                </div>
                <div className="account-nav-item">
                  <Receipt size={18} style={{marginRight: '12px'}}/> Đơn hàng của tôi
                  <span className="badge-count" style={{ marginLeft: 'auto', position: 'static', background: 'var(--dark)', color: 'white', padding: '1px 6px', borderRadius: '10px', fontSize: '0.68rem' }}>5</span>
                </div>
                <div className="account-nav-item">
                  <MapPin size={18} style={{marginRight: '12px'}}/> Địa chỉ giao hàng
                </div>
                <div className="account-nav-item">
                  <Heart size={18} style={{marginRight: '12px'}}/> Sản phẩm yêu thích
                </div>
                <div className="account-nav-item">
                  <Lock size={18} style={{marginRight: '12px'}}/> Đổi mật khẩu
                </div>
                <div className="account-nav-divider"></div>
                <Link to="/login" className="account-nav-item text-danger">
                  <LogOut size={18} style={{marginRight: '12px'}}/> Đăng xuất
                </Link>
              </div>
            </div>


            {/* CONTENT */}
            <div>
              {/* PROFILE TAB */}
              <div id="tab-profile" className="tab-panel active">
                <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '1.8rem' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '1.5rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--border)' }}>
                    Thông tin cá nhân
                  </div>
                  <div className="alert alert-success" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={16} /> Tài khoản đã xác thực email
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Họ *</label>
                      <input type="text" className="form-control" defaultValue="Trần" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tên *</label>
                      <input type="text" className="form-control" defaultValue="Ngọc" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input type="email" className="form-control" defaultValue="tran.ngoc@email.com" />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Số điện thoại</label>
                      <input type="tel" className="form-control" defaultValue="0912 345 678" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Giới tính</label>
                      <select className="form-control">
                        <option>Nam</option>
                        <option>Nữ</option>
                        <option>Không muốn tiết lộ</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ngày sinh</label>
                    <input type="date" className="form-control" defaultValue="1998-05-15" />
                  </div>
                  <div className="flex-center" style={{ justifyContent: 'flex-end', gap: '1rem' }}>
                    <button className="btn btn-outline" style={{ color: 'var(--dark)', borderColor: 'var(--border)' }}>Hủy thay đổi</button>
                    <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Check size={18} /> Lưu thay đổi
                    </button>
                  </div>

                </div>
              </div>

              {/* Other tabs can be implemented conditionally in React */}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AccountPage;
