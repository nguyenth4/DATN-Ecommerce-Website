import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">

          <div className="footer-brand">
            <div className="mark"><span className="brand-mark">S</span> Sprylo</div>
            <p>Modern tech &amp; gadgets — straight from the makers, shipped fast, supported well. Since 2018, we've moved over 400,000 boxes.</p>
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23 7s-.2-1.5-.9-2.2c-.8-.9-1.8-.9-2.2-1C16.6 3.5 12 3.5 12 3.5s-4.6 0-7.9.3c-.4 0-1.4 0-2.2 1C1.2 5.5 1 7 1 7s-.2 1.7-.2 3.5v1.6c0 1.7.2 3.5.2 3.5s.2 1.5.9 2.2c.8.9 1.9.8 2.4.9 1.7.2 7.7.3 7.7.3s4.6 0 7.9-.3c.4 0 1.4 0 2.2-1 .7-.7.9-2.2.9-2.2s.2-1.7.2-3.5V10.5c0-1.7-.2-3.5-.2-3.5zM9.7 14.5V8.4l6 3-6 3.1z"/></svg>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Popular Categories</h4>
            <ul>
              <li><Link to="/products">Laptops &amp; Desktops</Link></li>
              <li><Link to="/products">Smart Home Electronics</Link></li>
              <li><Link to="/products">Smart Watches</Link></li>
              <li><Link to="/products">Headphones</Link></li>
              <li><Link to="/products">Internal Components</Link></li>
              <li><Link to="/products">Virtual Reality Headsets</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Let us help you</h4>
            <ul>
              <li><Link to="/account">My account</Link></li>
              <li><Link to="/order-tracking">My order</Link></li>
              <li><Link to="#">Shipping policy</Link></li>
              <li><Link to="#">Help centre</Link></li>
              <li><Link to="#">Events</Link></li>
              <li><Link to="/products">Popular products</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Resources</h4>
            <ul>
              <li><Link to="#">Blog</Link></li>
              <li><Link to="#">Newsletter</Link></li>
              <li><Link to="#">Help centre</Link></li>
              <li><Link to="#">Support</Link></li>
              <li><Link to="#">Reviews</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Get to know us</h4>
            <ul>
              <li><Link to="#">About us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/login">Login / Register</Link></li>
              <li><Link to="#">Terms &amp; conditions</Link></li>
              <li><Link to="#">Privacy policy</Link></li>
              <li><Link to="#">FAQs</Link></li>
            </ul>
          </div>

        </div>

        <div className="footer-bottom">
          <span>© 2026 Sprylo · All rights reserved</span>
          <span>
            Free HTML template · No framework · No build step. Distributed by{' '}
            <a href="https://themewagon.com/" target="_blank" rel="noreferrer">ThemeWagon</a>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;