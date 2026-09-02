import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">

          <div className="footer-brand">
            <div className="mark"><span className="brand-mark">S</span> Sprylo</div>
            <p>Chuyên kinh doanh Điện thoại thông minh chính hãng — Trực tiếp từ nhà sản xuất, giao hàng nhanh chóng, hỗ trợ tận tình. Từ năm 2018, chúng tôi đã phục vụ hơn 400.000 khách hàng.</p>
            <div className="socials" style={{ marginTop: 'var(--s4)' }}>
              <a href="#" aria-label="Twitter">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 5.8a8.5 8.5 0 0 1-2.4.7 4.2 4.2 0 0 0 1.8-2.3 8.4 8.4 0 0 1-2.6 1 4.2 4.2 0 0 0-7.2 3.8A11.9 11.9 0 0 1 3 4.8a4.2 4.2 0 0 0 1.3 5.6 4.2 4.2 0 0 1-1.9-.5v.1a4.2 4.2 0 0 0 3.4 4.1 4.2 4.2 0 0 1-1.9.1 4.2 4.2 0 0 0 3.9 2.9A8.4 8.4 0 0 1 2 18.7 11.9 11.9 0 0 0 8.5 21c7.7 0 11.9-6.4 11.9-11.9v-.5A8.5 8.5 0 0 0 22 5.8z"/></svg>
              </a>
              <a href="#" aria-label="LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8 18H5v-7h3v7zM6.5 9.7a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4zM18 18h-3v-4c0-1-.4-1.6-1.4-1.6S12 13 12 14v4H9v-7h3v1c.5-.8 1.4-1.2 2.4-1.2 2 0 3.6 1.4 3.6 4V18z"/></svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                </svg>
              </a>
              <a href="#" aria-label="YouTube">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23 7s-.2-1.5-.9-2.2c-.8-.9-1.8-.9-2.2-1C16.6 3.5 12 3.5 12 3.5s-4.6 0-7.9.3c-.4 0-1.4 0-2.2 1C1.2 5.5 1 7 1 7s-.2 1.7-.2 3.5v1.6c0 1.7.2 3.5.2 3.5s.2 1.5.9 2.2c.8.9 1.9.8 2.4.9 1.7.2 7.7.3 7.7.3s4.6 0 7.9-.3c.4 0-1.4 0-2.2-1 .7-.7.9-2.2.9-2.2s.2-1.7.2-3.5V10.5c0-1.7-.2-3.5-.2-3.5zM9.7 14.5V8.4l6 3-6 3.1z"/></svg>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Thương hiệu nổi bật</h4>
            <ul>
              <li><Link to="/products">iPhone (Apple)</Link></li>
              <li><Link to="/products">Samsung Galaxy</Link></li>
              <li><Link to="/products">Xiaomi / Redmi</Link></li>
              <li><Link to="/products">OPPO</Link></li>
              <li><Link to="/products">vivo</Link></li>
              <li><Link to="/products">Realme</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Hỗ trợ khách hàng</h4>
            <ul>
              <li><Link to="/account">Tài khoản của tôi</Link></li>
              <li><Link to="/order-tracking">Đơn hàng của tôi</Link></li>
              <li><Link to="#">Chính sách giao hàng</Link></li>
              <li><Link to="#">Trung tâm trợ giúp</Link></li>
              <li><Link to="#">Sự kiện</Link></li>
              <li><Link to="/products">Sản phẩm phổ biến</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Tài nguyên</h4>
            <ul>
              <li><Link to="#">Blog</Link></li>
              <li><Link to="#">Bản tin</Link></li>
              <li><Link to="#">Hướng dẫn</Link></li>
              <li><Link to="#">Hỗ trợ kỹ thuật</Link></li>
              <li><Link to="#">Đánh giá</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Về chúng tôi</h4>
            <ul>
              <li><Link to="#">Về Sprylo</Link></li>
              <li><Link to="/contact">Liên hệ</Link></li>
              <li><Link to="/login">Đăng nhập / Đăng ký</Link></li>
              <li><Link to="#">Điều khoản dịch vụ</Link></li>
              <li><Link to="#">Chính sách bảo mật</Link></li>
              <li><Link to="#">FAQs</Link></li>
            </ul>
          </div>

        </div>

        <div className="footer-bottom">
          <span>© 2026 Sprylo · Bảo lưu mọi quyền</span>
          <span>
            Bản quyền thuộc về Dự án Đồ án Tốt nghiệp E-commerce · Phát triển bởi{' '}
            <a href="#" target="_blank" rel="noreferrer">Nhóm Sinh Viên</a>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;