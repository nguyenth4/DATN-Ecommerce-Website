import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Star, 
  Heart, 
  Zap, 
  RotateCcw, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Minus, 
  Plus,
  ArrowRight
} from 'lucide-react';

const THUMBS = [
  'photo-1608043152269-423dbba4e7e1',
  'photo-1545454675-3531b543be5d',
  'photo-1589003077984-894e133dabab',
  'photo-1518770660439-4636190af475',
  'photo-1574920162043-b872873f19c8',
];

const RELATED = [
  { img: 'photo-1606220945770-b5b6c2c55bf1', name: 'Tai nghe Beats Studio Buds Pro', price: '280.000đ', stock: 67, stars: 4, count: 312 },
  { img: 'photo-1523275335684-37898b6baf30', name: 'Apple Watch Series 9', price: '680.000đ', stock: 41, stars: 5, count: 245, badge: 'Mới' },
  { img: 'photo-1590658268037-6bf12165a8df', name: 'Apple AirPods V57', price: '680.000đ', stock: 12, stars: 5, count: 124 },
  { img: 'photo-1565849904461-04a58ad377e0', name: 'Samsung S21 Ultra', price: '2.580.000đ', was: '2.780.000đ', stock: 24, stars: 5, count: 212, badge: 'Giảm giá' },
  { img: 'photo-1502920917128-1aa500764cbd', name: 'Máy ảnh Canon EOS R7 DSLR', price: '1.920.000đ', stock: 24, stars: 4, count: 67 },
];



const SPECS = [
  { label: 'Chip', value: 'Apple S7 SiP' },
  { label: 'Loa', value: 'Loa woofer 4 inch độ lệch cao, 5 loa tweeter tạo chùm tia' },
  { label: 'Kết nối', value: 'Wi-Fi 4, Bluetooth 5.0, Thread, U1' },
  { label: 'Âm thanh không gian', value: 'Có, với tính năng theo dõi đầu năng động' },
  { label: 'Kích thước', value: '168 × 142 mm · 2.3 kg' },
  { label: 'Trong hộp gồm', value: 'HomePod, cáp nguồn (1.8 m), tài liệu hướng dẫn' },
  { label: 'Bảo hành', value: 'Hạn chế 2 năm' },
];


const RATING_BREAKDOWN = [
  { stars: 5, pct: 82 },
  { stars: 4, pct: 14 },
  { stars: 3, pct: 3 },
  { stars: 2, pct: 1 },
  { stars: 1, pct: 0 },
];

const REVIEWS = [
  { name: 'Mira K.', time: '2 ngày trước', stars: 5, text: 'Đã mua một cặp stereo cho phòng khách. Tính năng cảm biến phòng tạo ra sự khác biệt thực sự — chúng thích ứng với nơi bạn đặt chúng. Thiết lập chỉ mất 90 giây với iPhone handoff.' },
  { name: 'Devan R.', time: '1 tuần trước', stars: 5, text: 'Thay thế chiếc Sonos cũ của tôi bằng cái này. Âm thanh không gian thực sự ấn tượng trên các bản nhạc Atmos. Chất lượng hoàn thiện tuyệt vời.' },
];


const tdLabelStyle = {
  padding: 'var(--s4) 0', color: 'var(--fg-mute)',
  fontFamily: 'var(--ff-mono)', fontSize: 'var(--text-xs)',
  letterSpacing: '0.06em', textTransform: 'uppercase', width: '40%',
};
const tdValStyle = { padding: 'var(--s4) 0', fontWeight: 600 };

const ProductDetailPage = () => {
  const [activeThumb, setActiveThumb] = useState(0);
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState(0);
  const [config, setConfig] = useState(1);
  const [care, setCare] = useState(0);
  const navigate = useNavigate();

  const colors = [
    { hex: '#FFFFFF', label: 'Trắng' },
    { hex: '#0F172A', label: 'Xanh Đen' },
    { hex: '#F97316', label: 'Cam' },
    { hex: '#4F46E5', label: 'Tím' },
  ];
  const configs = ['Đơn', 'Cặp Stereo · Tiết kiệm 40.000đ', 'Bộ 3 · Tiết kiệm 120.000đ'];
  const carePlans = ['Không bảo hiểm', '2 năm · 39.000đ', '3 năm · 59.000đ'];



  const decreaseQty = () => setQty((q) => Math.max(1, q - 1));
  const increaseQty = () => setQty((q) => q + 1);

  return (
    <>
      <main id="main">
        <div className="container">
          <div className="crumbs" style={{ paddingTop: 'var(--s5)' }}>
            <Link to="/">Trang chủ</Link> <span className="sep">›</span> <Link to="/products">Sản phẩm</Link> <span className="sep">›</span> <span>Loa</span>
          </div>


          <section className="product-detail">

            <div className="gallery">
              <div className="gallery-thumbs">
                {THUMBS.map((thumb, i) => (
                  <button
                    key={thumb}
                    className={activeThumb === i ? 'is-active' : ''}
                    onClick={() => setActiveThumb(i)}
                  >
                    <img src={`https://images.unsplash.com/${thumb}?w=200&q=80&auto=format&fit=crop`} alt="" />
                  </button>
                ))}
              </div>
              <figure className="gallery-main">
                <img src={`https://images.unsplash.com/${THUMBS[activeThumb]}?w=900&q=80&auto=format&fit=crop`} alt="HomePod 2nd Gen speaker" />
              </figure>
            </div>

            <div className="pdp-info">
              <span className="pdp-cat" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={14} fill="currentColor" /> Âm thanh · Nổi bật
              </span>
              <h1>Loa Apple HomePod Thế hệ 2</h1>
              <div className="rating-row">
                <div style={{ display: 'flex', gap: '2px', color: 'var(--amber)' }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <span>4.9 / 5 · 312 đánh giá</span>
                <span style={{ color: 'var(--rule-strong)' }}>|</span>
                <span style={{ color: 'var(--emerald)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', background: 'var(--emerald)', borderRadius: '999px', display: 'inline-block' }}></span>
                  Còn hàng · 22 sản phẩm
                </span>
              </div>
              <p className="desc">Âm thanh không gian, công nghệ cảm biến phòng và là trung tâm của hệ sinh thái Apple của bạn. Tích hợp chip S7, âm thanh tính toán động và tính năng chuyển tiếp liền mạch từ iPhone.</p>

              <div className="price-row">
                <span className="now">280.000đ</span>
                <span className="was">320.000đ</span>
                <span className="save">Tiết kiệm 12%</span>
              </div>



              <div className="option-block">
                <div className="label">Màu sắc</div>
                <div className="color-swatches">
                  {colors.map((c, i) => (
                    <button
                      key={c.label}
                      className={color === i ? 'is-active' : ''}
                      style={{ background: c.hex, borderRadius: '999px', outlineColor: 'var(--rule-strong)' }}
                      aria-label={c.label}
                      onClick={() => setColor(i)}
                    ></button>
                  ))}
                </div>
              </div>

              <div className="option-block">
                <div className="label">Cấu hình</div>

                <div className="option-pills">
                  {configs.map((c, i) => (
                    <button
                      key={c}
                      className={config === i ? 'is-active' : ''}
                      onClick={() => setConfig(i)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="option-block">
                <div className="label">Bảo hiểm AppleCare+</div>
                <div className="option-pills">
                  {carePlans.map((c, i) => (
                    <button
                      key={c}
                      className={care === i ? 'is-active' : ''}
                      onClick={() => setCare(i)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>


              <div className="pdp-cta">
                <div className="qty">
                  <button type="button" aria-label="Decrease" onClick={decreaseQty}><Minus size={16} /></button>
                  <input type="text" value={qty} inputMode="numeric" aria-label="Quantity" readOnly />
                  <button type="button" aria-label="Increase" onClick={increaseQty}><Plus size={16} /></button>
                </div>
                <Link to="/cart" className="btn btn--indigo" style={{ flex: 1, minWidth: '160px' }}>Thêm vào giỏ <ChevronRight size={18} /></Link>
                <Link to="/cart" className="btn btn--ink">Mua ngay</Link>
                <button className="icon-btn" aria-label="Yêu thích" style={{ background: 'var(--bg)' }}><Heart size={20} /></button>
              </div>

              <div className="pdp-features">
                <div className="pf"><span className="ic"><Zap size={14} /></span><span>Miễn phí giao hàng trên 500.000đ</span></div>
                <div className="pf"><span className="ic"><RotateCcw size={14} /></span><span>Đổi trả miễn phí 30 ngày</span></div>
                <div className="pf"><span className="ic"><Star size={14} /></span><span>Bảo hành hạn chế 2 năm</span></div>
                <div className="pf"><span className="ic"><Check size={14} /></span><span>Sản phẩm Apple chính hãng</span></div>
              </div>


            </div>

          </section>

          {/* Specs + reviews split */}
          <section className="section" style={{ paddingTop: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s8)' }}>

              <div>
                <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--s5)' }}>Thông số kỹ thuật</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                  <tbody>
                    {SPECS.map((spec, i) => (
                      <tr key={spec.label} style={i < SPECS.length - 1 ? { borderBottom: '1px solid var(--rule)' } : undefined}>
                        <td style={tdLabelStyle}>{spec.label}</td>
                        <td style={tdValStyle}>{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>


              <div>
                <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--s5)' }}>Đánh giá</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'var(--s5)', alignItems: 'center', padding: 'var(--s5)', background: 'var(--bg)', borderRadius: 'var(--r)', marginBottom: 'var(--s5)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--ff-display)', fontSize: '48px', fontWeight: 800, color: 'var(--ink)', lineHeight: 1 }}>4.9</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', color: 'var(--amber)', margin: '4px 0' }}>
                      {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--fg-mute)', marginTop: '4px' }}>312 đánh giá</div>
                  </div>

                  <div style={{ display: 'grid', gap: '6px', fontFamily: 'var(--ff-mono)', fontSize: 'var(--text-xs)', color: 'var(--fg-soft)' }}>
                    {RATING_BREAKDOWN.map((r) => (
                      <div key={r.stars} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '16px' }}>{r.stars}</span>
                        <span style={{ flex: 1, height: '6px', background: 'var(--rule)', borderRadius: '999px', overflow: 'hidden' }}>
                          <span style={{ display: 'block', width: `${r.pct}%`, height: '100%', background: 'var(--amber)' }}></span>
                        </span>
                        <span style={{ width: '28px', textAlign: 'right' }}>{r.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {REVIEWS.map((review) => (
                  <article key={review.name} style={{ borderBottom: '1px solid var(--rule)', paddingBottom: 'var(--s5)', marginBottom: 'var(--s5)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ fontWeight: 700 }}>{review.name}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--fg-mute)' }}>{review.time}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '2px', color: 'var(--amber)', marginBottom: '6px' }}>
                      {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < review.stars ? "currentColor" : "none"} />)}
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-soft)', lineHeight: 1.6 }}>{review.text}</p>
                  </article>
                ))}

                <button className="btn btn--ghost btn--block">Xem tất cả 312 đánh giá <ChevronRight size={16} /></button>
              </div>


            </div>
          </section>

          {/* Related products */}
          <section className="section">
            <div className="section-head">
              <h2>Có thể bạn sẽ thích</h2>
              <Link to="/shop" className="view-all">Tất cả sản phẩm <ChevronRight size={16} /></Link>
            </div>

            <div className="products">
              {RELATED.map((p) => (
                <article className="product-card" key={p.name}>
                  <div className="img-wrap">
                    {p.badge && (
                      <span className={`badge ${p.badge === 'Giảm giá' ? 'badge--sale' : ''}`}>{p.badge}</span>
                    )}
                    <button className="wishlist"><Heart size={18} /></button>
                    <img src={`https://images.unsplash.com/${p.img}?w=500&q=80&auto=format&fit=crop`} alt={p.name} />
                  </div>
                  <div className="stock"><span className="dot"></span>Còn hàng · {p.stock} sản phẩm</div>
                  <Link to="/product" className="name">{p.name}</Link>
                  <div className="price">
                    <span className="now">{p.price}</span>
                    {p.was && <span className="was">{p.was}</span>}
                  </div>
                  <div className="stars">
                    <div style={{ display: 'flex', gap: '2px', color: 'var(--amber)' }}>
                      {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < p.stars ? "currentColor" : "none"} />)}
                    </div>
                    <span className="count">({p.count})</span>
                  </div>
                  <Link to="/cart" className="btn">Đặt hàng ngay <ArrowRight size={16} /></Link>
                </article>

              ))}
            </div>
          </section>

        </div>
      </main>
    </>
  );
};

export default ProductDetailPage;