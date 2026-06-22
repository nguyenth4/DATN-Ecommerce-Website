import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Clock, 
  ArrowRight, 
  ChevronRight 
} from 'lucide-react';

const ContactPage = () => {
  return (
    <main id="main">
      <section className="page-head">
        <div className="container">
          <div className="crumbs">
            <Link to="/">Trang chủ</Link> <span className="sep">/</span> <span>Liên hệ & Hỗ trợ</span>
          </div>
          <h1>Trò chuyện với chúng tôi — chúng tôi giao hàng, nhưng cũng lắng nghe tin nhắn của bạn.</h1>
          <p>
            Ba cách để tiếp cận đội ngũ của chúng tôi: trò chuyện trực tiếp (nhanh nhất), email, hoặc biểu mẫu liên hệ này cho bất kỳ vấn đề nào cần đính kèm tệp. Chúng tôi thường phản hồi trong vòng 4 giờ làm việc.
          </p>
        </div>
      </section>


      <section>
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <div className="info-block">
                <div className="ic"><Mail size={20} /></div>
                <div>
                  <div className="label">GỬI EMAIL</div>
                  <div className="value">
                    <a href="mailto:support@sprylo.example">support@sprylo.example</a>
                  </div>
                </div>
              </div>
              <div className="info-block">
                <div className="ic"><Phone size={20} /></div>
                <div>
                  <div className="label">GỌI CHO CHÚNG TÔI · 24/7</div>
                  <div className="value">
                    <a href="tel:+18005551234">+1 (800) 555-1234</a>
                  </div>
                </div>
              </div>
              <div className="info-block">
                <div className="ic"><MessageSquare size={20} /></div>
                <div>
                  <div className="label">TRÒ CHUYỆN TRỰC TIẾP</div>
                  <div className="value">
                    <Link to="#">Mở chat — 4 nhân viên đang online</Link>
                  </div>
                </div>
              </div>
              <div className="info-block">
                <div className="ic"><MapPin size={20} /></div>
                <div>
                  <div className="label">GHÉ THĂM CỬA HÀNG</div>
                  <div className="value">
                    214 Đường Market
                    <br />
                    San Francisco, CA 94103
                  </div>
                </div>
              </div>
              <div className="info-block">
                <div className="ic"><Clock size={20} /></div>
                <div>
                  <div className="label">GIỜ HỖ TRỢ</div>
                  <div className="value">
                    Thứ 2 — Thứ 6 · 06:00 — 22:00 PT
                    <br />
                    Thứ 7 — CN · 08:00 — 18:00 PT
                  </div>
                </div>
              </div>


              <div
                style={{
                  marginTop: 'var(--s7)',
                  padding: 'var(--s6)',
                  background: 'linear-gradient(135deg, var(--indigo), var(--card-purple))',
                  color: 'var(--paper)',
                  borderRadius: 'var(--r-lg)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.18) 0, transparent 40%)',
                    pointerEvents: 'none',
                  }}
                ></div>
                <div style={{ position: 'relative' }}>
                  <h3 style={{ color: 'var(--paper)', fontSize: 'var(--text-xl)', marginBottom: 'var(--s3)' }}>
                    Looking for trade or bulk pricing?
                  </h3>
                  <p
                    style={{
                      color: 'rgba(255,255,255,0.85)',
                      fontSize: 'var(--text-sm)',
                      lineHeight: 1.6,
                      marginBottom: 'var(--s4)',
                    }}
                  >
                    Companies ordering 10+ units qualify for tiered discounts, NET-30 terms, and a dedicated account
                    manager.
                  </p>
                  <a href="mailto:trade@sprylo.example" className="btn btn--paper">
                    Email the trade desk →
                  </a>
                </div>
              </div>
            </div>

            <form
              className="contact-form"
              onSubmit={(e) => {
                e.preventDefault();
                const btn = e.currentTarget.querySelector('button[type=submit]');
                if (btn) btn.textContent = 'Đã gửi ✓ — chúng tôi sẽ phản hồi trong 4 giờ';
              }}
            >
              <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--s2)' }}>Gửi tin nhắn cho chúng tôi</h2>
              <p style={{ color: 'var(--fg-soft)', fontSize: 'var(--text-sm)', marginBottom: 'var(--s5)' }}>
                Không phải bot, không phải phản hồi mẫu — một nhân viên thực thụ tại văn phòng SF hoặc Berlin của chúng tôi sẽ tiếp nhận vấn đề này.
              </p>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="c-first">Tên</label>
                  <input id="c-first" type="text" required placeholder="Nguyễn" />
                </div>
                <div className="field">
                  <label htmlFor="c-last">Họ</label>
                  <input id="c-last" type="text" required placeholder="Văn A" />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="c-email">Email</label>
                  <input id="c-email" type="email" required placeholder="ban@vi-du.com" />
                </div>
                <div className="field">
                  <label htmlFor="c-phone">Số điện thoại (tùy chọn)</label>
                  <input id="c-phone" type="tel" placeholder="09xx xxx xxx" />
                </div>
              </div>

              <div className="field">
                <label htmlFor="c-topic">Chủ đề là gì?</label>
                <select id="c-topic">
                  <option>Đơn hàng — theo dõi, thay đổi hoặc hủy</option>
                  <option>Đổi trả hoặc hoàn tiền</option>
                  <option>Khiếu nại bảo hành hoặc vấn đề sản phẩm</option>
                  <option>Yêu cầu thương mại / bán buôn</option>
                  <option>Báo chí, đối tác hoặc liên kết</option>
                  <option>Vấn đề khác</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="c-order">Mã đơn hàng (nếu có)</label>
                <input id="c-order" type="text" placeholder="vd: SPR-204418" />
              </div>

              <div className="field">
                <label htmlFor="c-msg">Tin nhắn của bạn</label>
                <textarea
                  id="c-msg"
                  required
                  placeholder="Hãy cho chúng tôi biết vấn đề của bạn. Ảnh chụp màn hình luôn được hoan nghênh."
                ></textarea>
              </div>

              <button
                className="btn btn--indigo btn--block"
                type="submit"
                style={{ padding: '16px', fontSize: 'var(--text-base)', marginTop: 'var(--s2)' }}
              >
                Gửi tin nhắn <ArrowRight size={18} style={{marginLeft: '8px'}}/>
              </button>


              <p
                style={{
                  fontFamily: 'var(--ff-mono)',
                  fontSize: '11px',
                  color: 'var(--fg-mute)',
                  marginTop: 'var(--s4)',
                  textAlign: 'center',
                  lineHeight: 1.6,
                }}
              >
                By submitting, you agree to our{' '}
                <Link to="#" style={{ color: 'var(--indigo)' }}>
                  privacy policy
                </Link>
                . We never sell your data and never share with third parties.
              </p>
            </form>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div className="section-head">
            <h2>Quick answers</h2>
            <Link to="#" className="view-all">
              Full help centre →
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--s5)' }}>
            <article
              style={{
                background: 'var(--paper)',
                border: '1px solid var(--rule)',
                borderRadius: 'var(--r)',
                padding: 'var(--s5)',
              }}
            >
              <h3 style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--s2)' }}>Where is my order?</h3>
              <p style={{ color: 'var(--fg-soft)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                Every order ships with a tracking number sent by email within 2 hours of dispatch. Use the{' '}
                <Link to="#" style={{ color: 'var(--indigo)', fontWeight: 600 }}>
                  order tracker
                </Link>{' '}
                with your email + order number for live status.
              </p>
            </article>

            <article
              style={{
                background: 'var(--paper)',
                border: '1px solid var(--rule)',
                borderRadius: 'var(--r)',
                padding: 'var(--s5)',
              }}
            >
              <h3 style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--s2)' }}>How do returns work?</h3>
              <p style={{ color: 'var(--fg-soft)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                30 days, no questions asked. Initiate from your account → orders → return. We email a prepaid label;
                drop off at any carrier point. Refund hits your card 3 – 5 business days after we receive it.
              </p>
            </article>

            <article
              style={{
                background: 'var(--paper)',
                border: '1px solid var(--rule)',
                borderRadius: 'var(--r)',
                padding: 'var(--s5)',
              }}
            >
              <h3 style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--s2)' }}>Do you ship internationally?</h3>
              <p style={{ color: 'var(--fg-soft)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                Yes — to 48 countries. Free standard shipping on orders over $50 to the US, EU, UK, Canada, and
                Australia. Other destinations carry a flat shipping fee shown at checkout.
              </p>
            </article>

            <article
              style={{
                background: 'var(--paper)',
                border: '1px solid var(--rule)',
                borderRadius: 'var(--r)',
                padding: 'var(--s5)',
              }}
            >
              <h3 style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--s2)' }}>What is the warranty?</h3>
              <p style={{ color: 'var(--fg-soft)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                Every Sprylo order ships with a 2-year limited warranty in addition to the manufacturer's. Optional
                extended cover (3 or 5 years) can be added at checkout from $39.
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ContactPage;
