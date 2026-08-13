import React, { useState, useEffect } from 'react';

interface Review {
  id?: string;
  name?: string;
  user_name?: string;
  rating: number;
  date?: string;
  created_at?: string;
  comment: string;
}

interface ProductReviewsTabProps {
  reviews: Review[];
  rating: number;
  newReviewName: string;
  newReviewRating: number;
  newReviewComment: string;
  setNewReviewName: (val: string) => void;
  setNewReviewRating: (val: number) => void;
  setNewReviewComment: (val: string) => void;
  onAddReview: (e: React.FormEvent) => void;
  errorMessage?: string;
  successMessage?: string;
}

const ProductReviewsTab: React.FC<ProductReviewsTabProps> = ({
  reviews,
  rating,
  newReviewName,
  newReviewRating,
  newReviewComment,
  setNewReviewName,
  setNewReviewRating,
  setNewReviewComment,
  onAddReview,
  errorMessage,
  successMessage,
}) => {
  const [customerInfo, setCustomerInfo] = useState<any>(() => {
    const info = localStorage.getItem('customer_info');
    return info ? JSON.parse(info) : null;
  });

  const [testUser, setTestUser] = useState(localStorage.getItem('test_customer_id') || 'cus_01KWH0KYDJM5N7GW2G6WMXMXC4');

  useEffect(() => {
    const handleAuthChange = () => {
      const info = localStorage.getItem('customer_info');
      setCustomerInfo(info ? JSON.parse(info) : null);
    };
    window.addEventListener('customer-auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('customer-auth-change', handleAuthChange);
    };
  }, []);

  const isLoggedIn = !!customerInfo;
  const customerName = customerInfo 
    ? `${customerInfo.last_name || ''} ${customerInfo.first_name || ''}`.trim() || customerInfo.email
    : '';

  useEffect(() => {
    if (isLoggedIn) {
      setNewReviewName(customerName);
    } else {
      // Tự động đồng bộ tên khi đổi user test
      if (testUser === 'cus_01KWH0KYDJM5N7GW2G6WMXMXC4') {
        setNewReviewName('Trần Ngọc');
      } else {
        setNewReviewName('Huỳnh Trần Khang Hỷ');
      }
      localStorage.setItem('test_customer_id', testUser);
    }
  }, [testUser, isLoggedIn, customerName, setNewReviewName]);

  const handleUserChange = (val: string) => {
    setTestUser(val);
    localStorage.setItem('test_customer_id', val);
    window.dispatchEvent(new Event('test-customer-changed'));
  };

  // Tính toán biểu đồ sao động
  const totalReviews = reviews.length;
  const starCounts = [0, 0, 0, 0, 0];
  reviews.forEach(r => {
    const s = Math.round(r.rating);
    if (s >= 1 && s <= 5) {
      starCounts[s - 1]++;
    }
  });

  const getPercentage = (stars: number) => {
    if (totalReviews === 0) return 0;
    return Math.round((starCounts[stars - 1] / totalReviews) * 100);
  };

  const getStarsString = (ratingValue: number) => {
    const r = Math.round(ratingValue);
    return "★".repeat(r) + "☆".repeat(5 - r);
  };

  return (
    <div id="panelReview" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '3rem' }}>
      
      {/* Cột trái: Biểu đồ điểm số */}
      <div style={{ background: '#fafafa', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border)', alignSelf: 'start', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>ĐÁNH GIÁ TRUNG BÌNH</h3>
        <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--dark)' }}>{rating}</div>
        <div className="stars" style={{ color: '#ffc107', fontSize: '1.4rem', margin: '0.5rem 0' }}>
          {getStarsString(rating)}
        </div>
        <p className="text-xs text-muted" style={{ marginBottom: '1.5rem' }}>({reviews.length} đánh giá khách hàng)</p>
        
        {/* Cột phần trăm sao động */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
          {[5, 4, 3, 2, 1].map((stars) => {
            const pct = getPercentage(stars);
            return (
              <div key={stars} style={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', gap: '0.5rem' }}>
                <span style={{ width: '40px' }}>{stars} sao</span>
                <div style={{ flex: 1, height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: '#ffc107' }}></div>
                </div>
                <span style={{ width: '30px', textAlign: 'right' }}>{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cột phải: Viết đánh giá & Danh sách đánh giá */}
      <div>
        {/* Form viết đánh giá */}
        <form onSubmit={onAddReview} style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}><i className="bi bi-pencil-square"></i> Viết đánh giá của bạn</h4>
            
            {/* Swticher tài khoản test hoặc thông tin tài khoản đăng nhập */}
            {isLoggedIn ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
                <i className="bi bi-person-check-fill" style={{ fontSize: '0.9rem' }}></i>
                <span>Tài khoản: {customerName}</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                <span style={{ color: '#666' }}>Tài khoản test:</span>
                <select 
                  value={testUser} 
                  onChange={(e) => handleUserChange(e.target.value)}
                  style={{ padding: '2px 6px', border: '1px solid var(--border)', borderRadius: '4px', background: '#f5f5f5', fontSize: '0.75rem' }}
                >
                  <option value="cus_01KWH0KYDJM5N7GW2G6WMXMXC4">Trần Ngọc (Chưa mua)</option>
                  <option value="cus_01KVS3CAPF91NGY79S5F3TAC7S">Khang Hỷ (Đã mua)</option>
                </select>
              </div>
            )}
          </div>

          {errorMessage && (
            <div style={{
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              color: '#92400e'
            }}>
              <i className="bi bi-shield-exclamation" style={{ fontSize: '1rem', flexShrink: 0, marginTop: '1px' }}></i>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success" style={{ padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', border: '1px solid #dcfce7', color: '#166534' }}>
              <i className="bi bi-check-circle-fill"></i> {successMessage}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Tên của bạn *</label>
              <input 
                type="text" 
                value={newReviewName} 
                disabled
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: '#f5f5f5', cursor: 'not-allowed' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Số sao đánh giá *</label>
              <select 
                value={newReviewRating} 
                onChange={(e) => setNewReviewRating(Number(e.target.value))} 
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
              >
                <option value={5}>★★★★★ (5 sao)</option>
                <option value={4}>★★★★☆ (4 sao)</option>
                <option value={3}>★★★☆☆ (3 sao)</option>
                <option value={2}>★★☆☆☆ (2 sao)</option>
                <option value={1}>★☆☆☆☆ (1 sao)</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nội dung đánh giá *</label>
              <span style={{
                fontSize: '0.7rem',
                color: newReviewComment.replace(/\s+/g, '').length < 10 ? '#ef4444' : '#6b7280',
                fontWeight: newReviewComment.replace(/\s+/g, '').length < 10 ? 600 : 400
              }}>
                {newReviewComment.replace(/\s+/g, '').length}/10 ký tự tối thiểu
              </span>
            </div>
            <textarea
              rows={4}
              value={newReviewComment}
              onChange={(e) => setNewReviewComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm thực tế của bạn về sản phẩm này..."
              maxLength={1000}
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                border: `1px solid ${newReviewComment.replace(/\s+/g, '').length > 0 && newReviewComment.replace(/\s+/g, '').length < 10 ? '#fca5a5' : 'var(--border)'}`,
                borderRadius: 'var(--radius)',
                resize: 'vertical',
                fontSize: '0.85rem',
                lineHeight: '1.6',
                transition: 'border-color 0.2s'
              }}
            ></textarea>
            <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.3rem' }}>
              💡 Vui lòng chia sẻ trải nghiệm thực tế. Không dùng ngôn ngữ thô tục, không đăng link, không spam.
            </p>
          </div>
          <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0.5rem 1.5rem' }}>Gửi đánh giá</button>
        </form>

        {/* Danh sách các review */}
        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Ý kiến khách hàng</h4>
        
        {reviews.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: '#888', fontStyle: 'italic' }}>Chưa có đánh giá nào cho sản phẩm này.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {reviews.map((rev, idx) => {
              const name = rev.user_name || rev.name || "Khách hàng";
              const initials = name.trim().split(" ").pop()?.[0]?.toUpperCase() || "K";
              const dateStr = rev.created_at 
                ? new Date(rev.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                : rev.date || "Vừa xong";

              return (
                <div key={idx} style={{ display: 'flex', gap: '1rem', paddingBottom: '1.2rem', borderBottom: '1px solid #f0f0f0' }}>
                  {/* Avatar */}
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    background: '#e0e7ff', 
                    color: 'var(--indigo, #4f46e5)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    flexShrink: 0,
                    border: '1px solid #c7d2fe'
                  }}>
                    {initials}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{name}</span>
                      <span style={{ fontSize: '0.75rem', color: '#999' }}>{dateStr}</span>
                    </div>
                    <div className="stars" style={{ color: '#ffc107', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                      {"★".repeat(rev.rating) + "☆".repeat(5 - rev.rating)}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#444', lineHeight: '1.6' }}>{rev.comment}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default ProductReviewsTab;

