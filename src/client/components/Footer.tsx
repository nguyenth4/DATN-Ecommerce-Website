import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-section">
          <h3>TechStore</h3>
          <p>Hệ thống bán lẻ điện thoại và phụ kiện công nghệ cao cấp.</p>
        </div>
        <div className="footer-section">
          <h4>Về chúng tôi</h4>
          <ul>
            <li>Giới thiệu</li>
            <li>Tuyển dụng</li>
            <li>Tin tức</li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Chính sách</h4>
          <ul>
            <li>Chính sách bảo hành</li>
            <li>Chính sách đổi trả</li>
            <li>Chính sách bảo mật</li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Hỗ trợ khách hàng</h4>
          <ul>
            <li>Gọi mua hàng: 1800.1060</li>
            <li>Khiếu nại: 1800.1062</li>
            <li>Bảo hành: 1800.1064</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 TechStore. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
