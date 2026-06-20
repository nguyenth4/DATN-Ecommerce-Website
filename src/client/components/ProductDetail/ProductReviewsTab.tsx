import React from 'react';

interface Review {
  name: string;
  rating: number;
  date: string;
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
}) => {
  return (
    <div id="panelReview" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '3rem' }}>
      
      {/* Cột trái: Biểu đồ điểm số */}
      <div style={{ background: '#fafafa', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border)', alignSelf: 'start', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>ĐÁNH GIÁ TRUNG BÌNH</h3>
        <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--dark)' }}>{rating}</div>
        <div className="stars" style={{ color: '#ffc107', fontSize: '1.4rem', margin: '0.5rem 0' }}>★★★★★</div>
        <p className="text-xs text-muted" style={{ marginBottom: '1.5rem' }}>({reviews.length} đánh giá khách hàng)</p>
        
        {/* Cột phần trăm sao */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', gap: '0.5rem' }}>
            <span style={{ width: '40px' }}>5 sao</span>
            <div style={{ flex: 1, height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '85%', height: '100%', background: '#ffc107' }}></div>
            </div>
            <span style={{ width: '30px', textAlign: 'right' }}>85%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', gap: '0.5rem' }}>
            <span style={{ width: '40px' }}>4 sao</span>
            <div style={{ flex: 1, height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '12%', height: '100%', background: '#ffc107' }}></div>
            </div>
            <span style={{ width: '30px', textAlign: 'right' }}>12%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', gap: '0.5rem' }}>
            <span style={{ width: '40px' }}>3 sao</span>
            <div style={{ flex: 1, height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '3%', height: '100%', background: '#ffc107' }}></div>
            </div>
            <span style={{ width: '30px', textAlign: 'right' }}>3%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', gap: '0.5rem' }}>
            <span style={{ width: '40px' }}>2 sao</span>
            <div style={{ flex: 1, height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '0%', height: '100%', background: '#ffc107' }}></div>
            </div>
            <span style={{ width: '30px', textAlign: 'right' }}>0%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', gap: '0.5rem' }}>
            <span style={{ width: '40px' }}>1 sao</span>
            <div style={{ flex: 1, height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '0%', height: '100%', background: '#ffc107' }}></div>
            </div>
            <span style={{ width: '30px', textAlign: 'right' }}>0%</span>
          </div>
        </div>
      </div>

      {/* Cột phải: Viết đánh giá & Danh sách đánh giá */}
      <div>
        {/* Form viết đánh giá */}
        <form onSubmit={onAddReview} style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '2rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}><i className="bi bi-pencil-square"></i> Viết đánh giá của bạn</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Tên của bạn *</label>
              <input 
                type="text" 
                value={newReviewName} 
                onChange={(e) => setNewReviewName(e.target.value)} 
                placeholder="Nhập tên..." 
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }} 
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
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Nội dung đánh giá *</label>
            <textarea 
              rows={3} 
              value={newReviewComment} 
              onChange={(e) => setNewReviewComment(e.target.value)} 
              placeholder="Nhập bình luận chi tiết..." 
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary btn-sm">Gửi đánh giá</button>
        </form>

        {/* Danh sách các review */}
        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Ý kiến khách hàng</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {reviews.map((rev, idx) => (
            <div key={idx} style={{ paddingBottom: '1.2rem', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{rev.name}</span>
                <span style={{ fontSize: '0.75rem', color: '#999' }}>{rev.date}</span>
              </div>
              <div className="stars" style={{ color: '#ffc107', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                {"★".repeat(rev.rating) + "☆".repeat(5 - rev.rating)}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#444', lineHeight: '1.6' }}>{rev.comment}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ProductReviewsTab;
