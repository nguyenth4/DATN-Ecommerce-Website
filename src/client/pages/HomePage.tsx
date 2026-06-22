import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  ArrowRight, 
  ChevronRight, 
  Heart, 
  Star, 
  ShoppingCart,
  Mail
} from 'lucide-react';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <main id="main">

      {/* HERO: bento grid */}
      <section className="hero">
        <div className="container">
          <div className="bento">

            <article className="bento-card bento-card--lg">
              <div className="sparkle"></div>
              <div>
                <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Zap size={14} fill="currentColor" /> Âm thanh · Nổi bật
                </span>
                <h2>Apple HomePod<br />Loa Thế hệ 2</h2>
                <p>Hệ sinh thái Apple với khả năng phát âm thanh chất lượng cao, đồng thời là trung tâm điều khiển các thiết bị nhà thông minh. Âm thanh không gian, công nghệ cảm biến phòng.</p>
                <Link to="/products" className="btn btn--paper">Mua ngay
                  <ChevronRight size={16} />
                </Link>
                <div className="dots"><span className="active"></span><span></span><span></span></div>
              </div>
              <img className="product" src="https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=900&q=80&auto=format&fit=crop" alt="HomePod speaker" />
            </article>


            <article className="bento-card bento-card--purple">
              <div className="sparkle"></div>
              <span className="eyebrow">Thiết bị đeo</span>
              <h3 style={{ fontSize: 'var(--text-xl)', lineHeight: 1.15 }}>Khám phá<br />Apple Watch</h3>
              <Link to="/products" className="shop-now">Mua ngay
                <ChevronRight size={14} />
              </Link>
              <img className="product" src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80&auto=format&fit=crop" alt="Apple Watch" />
            </article>

            <article className="bento-card bento-card--teal">
              <div className="sparkle"></div>
              <span className="eyebrow">Điện thoại mới nhất</span>
              <h3 style={{ fontSize: 'var(--text-xl)', lineHeight: 1.15 }}>Galaxy S24<br />Ultra · 5G</h3>
              <Link to="/products" className="shop-now">Mua ngay
                <ChevronRight size={14} />
              </Link>
              <img className="product" src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80&auto=format&fit=crop" alt="Samsung Galaxy phone" />
            </article>


            <div className="bento-row">
              <article className="bento-card bento-card--orange">
                <div className="sparkle"></div>
                <span className="eyebrow">Máy ảnh</span>
                <h3 style={{ fontSize: 'var(--text-lg)', lineHeight: 1.2 }}>Samsung<br />Gear Camera</h3>
                <Link to="/products" className="shop-now">Mua ngay
                  <ChevronRight size={14} />
                </Link>
                <img className="product" src="https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500&q=80&auto=format&fit=crop" alt="Camera" />
              </article>

              <article className="bento-card bento-card--green">
                <div className="sparkle"></div>
                <span className="eyebrow">Âm thanh</span>
                <h3 style={{ fontSize: 'var(--text-lg)', lineHeight: 1.2 }}>Beats<br />Studio Buds</h3>
                <Link to="/products" className="shop-now">Mua ngay
                  <ChevronRight size={14} />
                </Link>
                <img className="product" src="https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500&q=80&auto=format&fit=crop" alt="Earbuds" />
              </article>

              <article className="bento-card bento-card--black">
                <div className="sparkle"></div>
                <span className="eyebrow">Máy ảnh DSLR</span>
                <h3 style={{ fontSize: 'var(--text-lg)', lineHeight: 1.2 }}>Hero Camera<br />X-Series</h3>
                <Link to="/products" className="shop-now">Mua ngay
                  <ChevronRight size={14} />
                </Link>
                <img className="product" src="https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&q=80&auto=format&fit=crop" alt="DSLR camera" />
              </article>

            </div>

          </div>
        </div>
      </section>

      {/* TRENDING PRODUCTS */}
      <section className="section" style={{ paddingTop: 'var(--s5)' }}>
        <div className="container">
          <div className="section-head">
            <h2>Sản phẩm thịnh hành</h2>
            <Link to="/products" className="view-all">Xem tất cả
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="tabs" role="tablist">
            {['Điện thoại', 'Đồng hồ', 'Máy ảnh', 'Phụ kiện', 'Loa'].map((tab, i) => (
              <button
                key={tab}
                className={`tab${activeTab === i ? ' is-active' : ''}`}
                role="tab"
                aria-selected={activeTab === i}
                onClick={() => setActiveTab(i)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="products">
            {[
              { img: 'photo-1511707171634-5f897ff02aa9', name: 'Galaxy Note 20 Ultra 5G', price: '2.780.000đ', stock: 52, stars: '★★★★★', count: 56, badge: 'New' },
              { img: 'photo-1561154464-82e9adf32764', name: 'iPad 10th Generation', price: '1.780.000đ', was: '1.980.000đ', stock: 32, stars: '★★★★★', count: 124, badge: 'Sale' },
              { img: 'photo-1592899677977-9c10ca588bbd', name: 'Galaxy Note 20 Ultra 5G', price: '2.780.000đ', stock: 41, stars: '★★★★☆', count: 89 },
              { img: 'photo-1565849904461-04a58ad377e0', name: 'Samsung S21 Ultra', price: '2.780.000đ', stock: 24, stars: '★★★★★', count: 212, badge: 'New' },
              { img: 'photo-1592750475338-74b7b21085ab', name: 'Samsung Galaxy Note 20', price: '2.780.000đ', stock: 67, stars: '★★★★★', count: 98 },
            ].map((p, i) => (

              <article key={i} className="product-card">
                <div className="img-wrap">
                  {p.badge && <span className={`badge${p.badge === 'Sale' ? ' badge--sale' : ''}`}>{p.badge === 'Sale' ? 'Giảm giá' : 'Mới'}</span>}
                  <button className="wishlist" aria-label="Wishlist"><Heart size={18} /></button>
                  <img src={`https://images.unsplash.com/${p.img}?w=500&q=80&auto=format&fit=crop`} alt={p.name} />
                </div>
                <div className="stock"><span className="dot"></span>Còn hàng · {p.stock} sản phẩm</div>
                <Link to="/products/1" className="name">{p.name}</Link>
                <div className="price">
                  <span className="now">{p.price}</span>
                  {p.was && <span className="was">{p.was}</span>}
                </div>
                <div className="stars">
                  <div style={{ display: 'flex', gap: '2px', color: '#fbbf24' }}>
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} size={14} fill={idx < 4 ? "#fbbf24" : "none"} />
                    ))}
                  </div>
                  <span className="count">({p.count})</span>
                </div>
                <Link to="/cart" className="btn">Đặt ngay <ChevronRight size={16} /></Link>
              </article>

            ))}
          </div>
        </div>
      </section>

      {/* DISCOUNT BANNERS */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="discount-row">
            <article className="discount-card discount-card--watch">
              <span className="meta">CHỈ TRONG TUẦN NÀY</span>
              <h3>Ưu Đãi Lớn<br /><span className="pct">Giảm 50%</span></h3>
              <Link to="/products" className="shop-now">Mua ngay
                <ChevronRight size={14} />
              </Link>
              <img className="product" src="https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&q=80&auto=format&fit=crop" alt="Smart watch" />
            </article>
            <article className="discount-card discount-card--airpods">
              <span className="meta">PHIÊN BẢN GIỚI HẠN</span>
              <h3>Studio Buds Pro<br /><span className="pct">Giảm 30%</span></h3>
              <Link to="/products" className="shop-now">Mua ngay
                <ChevronRight size={14} />
              </Link>
              <img className="product" src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80&auto=format&fit=crop" alt="Earbuds" />
            </article>
          </div>

        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section" style={{ paddingTop: 'var(--s5)' }}>
        <div className="container">
          <div className="section-head">
            <h2>Mua sắm theo danh mục</h2>
            <Link to="/products" className="view-all">Xem tất cả sản phẩm
              <ChevronRight size={16} />
            </Link>
          </div>
          <div className="cats-grid">
            {[
              { img: 'photo-1523275335684-37898b6baf30', name: 'Đồng hồ', count: 28 },
              { img: 'photo-1502920917128-1aa500764cbd', name: 'Máy ảnh', count: 42 },
              { img: 'photo-1511707171634-5f897ff02aa9', name: 'Điện thoại', count: 76 },
              { img: 'photo-1592840496694-26d035b52b48', name: 'Phụ kiện', count: 112 },
              { img: 'photo-1606220945770-b5b6c2c55bf1', name: 'Tai nghe', count: 35 },
            ].map((c, i) => (
              <Link key={i} to="/products" className="cat-tile">
                <div className="pic"><img src={`https://images.unsplash.com/${c.img}?w=300&q=80&auto=format&fit=crop`} alt="" /></div>
                <div className="name">{c.name}</div>
                <div className="count">{c.count} Sản phẩm</div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* COMPACT ROW */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <h2>Dành cho bạn</h2>
            <Link to="/products" className="view-all">Nhiều lựa chọn hơn
              <ChevronRight size={16} />
            </Link>
          </div>
          <div className="compact-row">
            {[
              { img: 'photo-1590658268037-6bf12165a8df', name: 'Apple Airpods V57', price: '680.000đ', stock: 12 },
              { img: 'photo-1496181133206-80ce9b88a853', name: 'Apple MacBook Pro', price: '27.780.000đ', stock: 8 },
              { img: 'photo-1592840496694-26d035b52b48', name: 'Power Wired Controller', price: '190.000đ', stock: 24 },
              { img: 'photo-1527814050087-3793815479db', name: 'Gaming Mouse Pro', price: '190.000đ', stock: 36 },
            ].map((p, i) => (
              <article key={i} className="compact-card">
                <div className="pic"><img src={`https://images.unsplash.com/${p.img}?w=300&q=80&auto=format&fit=crop`} alt="" /></div>
                <div>
                  <div className="stock">CÒN HÀNG · {p.stock}</div>
                  <div className="name">{p.name}</div>
                  <div className="price">{p.price}</div>
                  <Link to="/cart" className="btn">Đặt Ngay</Link>
                </div>
              </article>
            ))}
          </div>

        </div>
      </section>

      {/* BRANDS */}
      <section className="brands">
        <div className="container">
          <div className="brand-row">
            {['HP', 'Huawei', 'Nokia', 'Samsung', 'Canon', 'Sony'].map((b) => (
              <a key={b} href="#" className="brand-logo">{b}</a>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section style={{ background: 'var(--paper)' }}>
        <div className="container">
          <div className="newsletter">
            <div className="newsletter-grid">
              <div>
                <h2>Nhận ngay <strong>GIẢM 20%</strong> cho đơn hàng đầu tiên — gửi trực tiếp đến hộp thư của bạn.</h2>
                <p>Để lại email của bạn và chúng tôi sẽ gửi mã giảm giá một lần, cùng những ưu đãi mới nhất về các thiết bị chúng tôi vừa nhập về. Huỷ đăng ký bất cứ lúc nào.</p>
              </div>
              <form
                className="newsletter-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  (e.currentTarget.querySelector('button') as HTMLButtonElement).textContent = 'Đã gửi ✓';
                }}
              >
                <input type="email" required placeholder="Nhập email của bạn" aria-label="Địa chỉ Email" />
                <button className="btn" type="submit">Đăng ký <ArrowRight size={18} /></button>
              </form>
            </div>
          </div>
        </div>
      </section>


    </main>
  );
};

export default HomePage;