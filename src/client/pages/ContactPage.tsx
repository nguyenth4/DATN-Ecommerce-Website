import { Link } from 'react-router-dom';

const ContactPage = () => {
  return (
    <main id="main">
      <section className="page-head">
        <div className="container">
          <div className="crumbs">
            <Link to="/">Home</Link> <span className="sep">›</span> <span>Contact &amp; support</span>
          </div>
          <h1>Talk to us — we ship gear, but we answer messages too.</h1>
          <p>
            Three ways to reach our team: live chat (fastest), email, or this contact form for anything that needs an
            attachment. We typically reply within 4 working hours and cover support in EN, ES, FR, and DE.
          </p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <div className="info-block">
                <div className="ic">✉</div>
                <div>
                  <div className="label">EMAIL US</div>
                  <div className="value">
                    <a href="mailto:support@sprylo.example">support@sprylo.example</a>
                  </div>
                </div>
              </div>
              <div className="info-block">
                <div className="ic">☏</div>
                <div>
                  <div className="label">CALL US · 24/7</div>
                  <div className="value">
                    <a href="tel:+18005551234">+1 (800) 555-1234</a>
                  </div>
                </div>
              </div>
              <div className="info-block">
                <div className="ic">💬</div>
                <div>
                  <div className="label">LIVE CHAT</div>
                  <div className="value">
                    <Link to="#">Open chat — 4 agents online</Link>
                  </div>
                </div>
              </div>
              <div className="info-block">
                <div className="ic">⌖</div>
                <div>
                  <div className="label">VISIT OUR FLAGSHIP</div>
                  <div className="value">
                    214 Market Street
                    <br />
                    San Francisco, CA 94103
                  </div>
                </div>
              </div>
              <div className="info-block">
                <div className="ic">⏱</div>
                <div>
                  <div className="label">SUPPORT HOURS</div>
                  <div className="value">
                    Mon — Fri · 06:00 — 22:00 PT
                    <br />
                    Sat — Sun · 08:00 — 18:00 PT
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
                if (btn) btn.textContent = 'Sent ✓ — we will reply within 4 hours';
              }}
            >
              <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--s2)' }}>Send us a message</h2>
              <p style={{ color: 'var(--fg-soft)', fontSize: 'var(--text-sm)', marginBottom: 'var(--s5)' }}>
                No bots, no templated replies — a real person at our SF or Berlin desks will pick this up.
              </p>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="c-first">First name</label>
                  <input id="c-first" type="text" required placeholder="Mira" />
                </div>
                <div className="field">
                  <label htmlFor="c-last">Last name</label>
                  <input id="c-last" type="text" required placeholder="Kapoor" />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="c-email">Email</label>
                  <input id="c-email" type="email" required placeholder="you@example.com" />
                </div>
                <div className="field">
                  <label htmlFor="c-phone">Phone (optional)</label>
                  <input id="c-phone" type="tel" placeholder="+1 (415) 555 0123" />
                </div>
              </div>

              <div className="field">
                <label htmlFor="c-topic">What is this about?</label>
                <select id="c-topic">
                  <option>Order — tracking, change, or cancellation</option>
                  <option>Returns or refunds</option>
                  <option>Warranty claim or product issue</option>
                  <option>Trade / wholesale inquiry</option>
                  <option>Press, partnership, or affiliate</option>
                  <option>Something else</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="c-order">Order number (if applicable)</label>
                <input id="c-order" type="text" placeholder="e.g. SPR-204418" />
              </div>

              <div className="field">
                <label htmlFor="c-msg">Your message</label>
                <textarea
                  id="c-msg"
                  required
                  placeholder="Tell us what's going on. Screenshots welcome — drag and drop after sending."
                ></textarea>
              </div>

              <button
                className="btn btn--indigo btn--block"
                type="submit"
                style={{ padding: '16px', fontSize: 'var(--text-base)', marginTop: 'var(--s2)' }}
              >
                Send message →
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
