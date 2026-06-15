import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">Shop<span>Flow</span></div>
            <p className="footer-desc">Nền tảng thương mại điện tử tích hợp biến thể sản phẩm và đơn vị vận chuyển hàng đầu Việt Nam.</p>
          </div>
          <div>
            <div className="footer-heading">Sản phẩm</div>
            <div className="footer-links">
              <Link to="#">Điện thoại</Link>
              <Link to="#">Laptop</Link>
              <Link to="#">Tai nghe</Link>
              <Link to="#">Smartwatch</Link>
            </div>
          </div>
          <div>
            <div className="footer-heading">Hỗ trợ</div>
            <div className="footer-links">
              <Link to="#">Tra cứu đơn hàng</Link>
              <Link to="#">Chính sách đổi trả</Link>
              <Link to="#">Bảo hành</Link>
              <Link to="#">Liên hệ</Link>
            </div>
          </div>
          <div>
            <div className="footer-heading">Thanh toán</div>
            <div className="footer-links">
              <Link to="#"><i className="bi bi-credit-card-2-front"></i> VNPay</Link>
              <Link to="#"><i className="bi bi-wallet2"></i> MoMo</Link>
              <Link to="#"><i className="bi bi-wallet"></i> ZaloPay</Link>
              <Link to="#"><i className="bi bi-cash"></i> COD</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 ShopFlow. FPT Polytechnic – Nhóm 5.</span>
          <span>WD20302</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
