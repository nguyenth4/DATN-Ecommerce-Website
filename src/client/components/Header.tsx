import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">Shop<span>Flow</span></Link>
      <ul className="navbar-nav">
        <li><Link to="/" className="active">Trang chủ</Link></li>
        <li><Link to="/products">Sản phẩm</Link></li>
        <li><Link to="/account">Tài khoản</Link></li>
      </ul>
      <div className="navbar-actions">
        <button className="btn-icon" title="Tìm kiếm"><i className="bi bi-search"></i></button>
        <button className="btn-icon" title="Yêu thích"><i className="bi bi-heart"></i></button>
        <Link to="/cart" className="btn-icon pos-relative" title="Giỏ hàng">
          <i className="bi bi-bag"></i>
          <span className="badge-count cart-badge-count">3</span>
        </Link>
        <Link to="/admin" className="btn-admin">
          <i className="bi bi-grid-3x3-gap"></i> Admin Panel
        </Link>
      </div>
    </nav>
  );
};

export default Header;
