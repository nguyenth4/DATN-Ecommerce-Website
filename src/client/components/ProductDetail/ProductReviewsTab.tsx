import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Review {
  id?: number;
  user_name?: string;
  name?: string;
  rating: number;
  comment: string;
  created_at?: string;
  date?: string;
  user_avatar?: string;
  avatar_url?: string;
}

interface ProductReviewsTabProps {
  productId: string;
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
  imageBase64?: string;
  mimeType?: string;
  setImageBase64?: (val: string) => void;
  setMimeType?: (val: string) => void;
}

const ProductReviewsTab: React.FC<ProductReviewsTabProps> = ({
  productId,
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
  imageBase64,
  mimeType,
  setImageBase64,
  setMimeType,
}) => {
  const [customerInfo, setCustomerInfo] = useState<any>(() => {
    const info = localStorage.getItem('customer_info');
    return info ? JSON.parse(info) : null;
  });

  const [testUser, setTestUser] = useState(localStorage.getItem('test_customer_id') || 'cus_01KWH0KYDJM5N7GW2G6WMXMXC4');
  const [isEligible, setIsEligible] = useState<boolean>(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState<boolean>(false);
  const [existingReview, setExistingReview] = useState<{ id: number; rating: number; comment: string } | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState<boolean>(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState<boolean>(true);

  // Local state for image upload in case the parent doesn't provide it
  const [localImageBase64, setLocalImageBase64] = useState<string>('');
  const [localMimeType, setLocalMimeType] = useState<string>('');

  const actualImageBase64 = imageBase64 !== undefined ? imageBase64 : localImageBase64;
  const actualMimeType = mimeType !== undefined ? mimeType : localMimeType;
  const setActualImageBase64 = setImageBase64 || setLocalImageBase64;
  const setActualMimeType = setMimeType || setLocalMimeType;

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

  const checkEligibility = async () => {
    setIsCheckingEligibility(true);
    try {
      let currentCustomerId = '';
      if (isLoggedIn && customerInfo?.id) {
        currentCustomerId = customerInfo.id;
      } else {
        currentCustomerId = testUser;
      }
      
      const MEDUSA_BACKEND_URL = (import.meta as any).env?.VITE_MEDUSA_BACKEND_URL || 'http://localhost:9000';
      const PUBLISHABLE_KEY = (import.meta as any).env?.VITE_MEDUSA_PUBLISHABLE_KEY || 'pk_a2f0825ab169a70b98f5a520693ca5e8e633f36c1b5dabd5548326c5451c4e6d';

      const res = await fetch(`${MEDUSA_BACKEND_URL}/store/reviews/check-eligibility?product_id=${productId}&customer_id=${currentCustomerId}`, {
        headers: {
          'x-publishable-api-key': PUBLISHABLE_KEY
        }
      });
      if (res.ok) {
        const data = await res.json();
        setIsEligible(data.isEligible);
        setAlreadyReviewed(data.alreadyReviewed || false);
        if (data.alreadyReviewed && data.existingReview) {
          setExistingReview(data.existingReview);
        } else {
          setExistingReview(null);
        }
      } else {
        setIsEligible(false);
        setAlreadyReviewed(false);
        setExistingReview(null);
      }
    } catch (err) {
      setIsEligible(false);
      setAlreadyReviewed(false);
      setExistingReview(null);
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  useEffect(() => {
    if (productId) {
      checkEligibility();
    }
    
    const handleReviewAdded = () => {
      checkEligibility();
    };

    window.addEventListener('review-added', handleReviewAdded);
    return () => {
      window.removeEventListener('review-added', handleReviewAdded);
    };
  }, [productId, isLoggedIn, customerInfo, testUser]);

  const handleUserChange = (val: string) => {
    setTestUser(val);
    localStorage.setItem('test_customer_id', val);
    window.dispatchEvent(new Event('test-customer-changed'));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setActualImageBase64('');
      setActualMimeType('');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        // Create an image to resize it
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 800; // max width/height to prevent huge base64 strings

          if (width > height && width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          } else if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const resizedDataUrl = canvas.toDataURL(file.type, 0.8);
          setActualImageBase64(resizedDataUrl);
          setActualMimeType(file.type);
        };
        img.src = dataUrl;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && existingReview) {
      setUpdateMessage(null);

      const commentTrimmed = newReviewComment.trim();
      if (!commentTrimmed) {
        setUpdateMessage({ type: 'error', text: 'Vui lòng nhập nội dung bình luận.' });
        return;
      }
      if (commentTrimmed.replace(/\s+/g, '').length < 10) {
        setUpdateMessage({ type: 'error', text: 'Bình luận quá ngắn, vui lòng viết chi tiết hơn (ít nhất 10 ký tự).' });
        return;
      }

      setIsSubmittingUpdate(true);
      try {
        let currentCustomerId = isLoggedIn && customerInfo?.id ? customerInfo.id : testUser;
        const MEDUSA_BACKEND_URL = (import.meta as any).env?.VITE_MEDUSA_BACKEND_URL || 'http://localhost:9000';
        const PUBLISHABLE_KEY = (import.meta as any).env?.VITE_MEDUSA_PUBLISHABLE_KEY || 'pk_a2f0825ab169a70b98f5a520693ca5e8e633f36c1b5dabd5548326c5451c4e6d';

        const res = await fetch(`${MEDUSA_BACKEND_URL}/store/reviews`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-publishable-api-key': PUBLISHABLE_KEY,
            'x-customer-id': currentCustomerId
          },
          body: JSON.stringify({
            review_id: existingReview.id,
            rating: newReviewRating,
            comment: newReviewComment,
            product_id: productId,
            customer_id: currentCustomerId,
            image_base64: actualImageBase64,
            mime_type: actualMimeType
          })
        });

        const data = await res.json();
        if (res.ok) {
          toast.success("Cập nhật đánh giá thành công!");
          setUpdateMessage({ type: 'success', text: 'Cập nhật đánh giá thành công!' });
          setExistingReview({
            ...existingReview,
            rating: newReviewRating,
            comment: newReviewComment
          });
          setIsEditing(false);
          await checkEligibility();
          window.dispatchEvent(new Event('review-updated'));
        } else {
          setUpdateMessage({ type: 'error', text: data.message || 'Cập nhật đánh giá thất bại.' });
          toast.error(data.message || 'Cập nhật thất bại.');
        }
      } catch (err) {
        setUpdateMessage({ type: 'error', text: 'Không thể kết nối đến server backend.' });
        toast.error('Lỗi kết nối server.');
      } finally {
        setIsSubmittingUpdate(false);
      }
    } else {
      onAddReview(e);
    }
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
        <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--dark)' }}>{rating > 0 ? rating : '-'}</div>
        <div className="stars" style={{ color: '#ffc107', fontSize: '1.4rem', margin: '0.5rem 0' }}>
          {rating > 0 ? getStarsString(rating) : <span style={{ fontSize: '1rem', color: 'var(--gray)' }}>Chưa có đánh giá</span>}
        </div>
        <p className="text-xs text-muted" style={{ marginBottom: '1.5rem' }}>({reviews.length} đánh giá khách hàng)</p>
        
        {/* Cột phần trăm sao động */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
          {[5, 4, 3, 2, 1].map(stars => (
            <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
              <span style={{ width: '35px', textAlign: 'right', fontWeight: 600 }}>{stars} sao</span>
              <div style={{ flex: 1, background: '#e0e0e0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${getPercentage(stars)}%`, background: '#ffc107', height: '100%', borderRadius: '4px', transition: 'width 0.3s' }}></div>
              </div>
              <span style={{ width: '35px', color: '#666' }}>{getPercentage(stars)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cột phải: Viết đánh giá & Danh sách đánh giá */}
      <div>
        {alreadyReviewed && !isEditing && (
          <div style={{ 
            background: '#f0fdf4', 
            border: '1px solid #bbf7d0', 
            color: '#166534', 
            padding: '1.25rem', 
            borderRadius: '10px', 
            fontSize: '0.85rem', 
            marginBottom: '2rem', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <i className="bi bi-check-circle-fill" style={{ color: '#16a34a', fontSize: '1.4rem', flexShrink: 0 }}></i>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.95rem', marginBottom: '2px', color: '#14532d' }}>
                    Bạn đã gửi đánh giá cho sản phẩm này ({existingReview?.rating || 5} ★)
                  </strong>
                  <span style={{ color: '#374151', fontStyle: 'italic', display: 'block' }}>"{existingReview?.comment}"</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  if (existingReview) {
                    setNewReviewRating(existingReview.rating);
                    setNewReviewComment(existingReview.comment);
                  }
                }}
                style={{
                  background: '#16a34a',
                  color: '#fff',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  whiteSpace: 'nowrap',
                  transition: 'background-color 0.2s'
                }}
              >
                <i className="bi bi-pencil-square"></i> Chỉnh sửa đánh giá
              </button>
            </div>
          </div>
        )}

        {/* Form viết hoặc chỉnh sửa đánh giá */}
        {(isEditing || (!isCheckingEligibility && isEligible && !alreadyReviewed)) && (
        <form onSubmit={handleFormSubmit} style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
              <i className="bi bi-pencil-square"></i> {isEditing ? "Chỉnh sửa đánh giá của bạn" : "Viết đánh giá của bạn"}
            </h4>
            
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

          {(errorMessage || updateMessage?.type === 'error') && (
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
              <span>{updateMessage?.text || errorMessage}</span>
            </div>
          )}

          {(successMessage || updateMessage?.type === 'success') && (
            <div className="alert alert-success" style={{ padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', border: '1px solid #dcfce7', color: '#166534' }}>
              <i className="bi bi-check-circle-fill"></i> {updateMessage?.text || successMessage}
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
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Số sao đánh giá *
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minHeight: '38px' }}>
                <div 
                  style={{ display: 'flex', gap: '0.2rem' }}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  {[1, 2, 3, 4, 5].map((star) => {
                    const currentRating = hoverRating || newReviewRating;
                    const isFilled = star <= currentRating;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReviewRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '0 1px',
                          fontSize: '1.75rem',
                          lineHeight: 1,
                          cursor: 'pointer',
                          color: isFilled ? '#f59e0b' : '#d1d5db',
                          transition: 'all 0.15s ease',
                          transform: (hoverRating === star || (hoverRating === 0 && newReviewRating === star)) ? 'scale(1.25)' : 'scale(1)',
                          outline: 'none'
                        }}
                        title={`${star} sao`}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>
                <span style={{ fontSize: '0.8rem', color: '#4b5563', fontWeight: 600 }}>
                  {hoverRating || newReviewRating} sao ({
                    { 5: "Cực kỳ hài lòng", 4: "Hài lòng", 3: "Bình thường", 2: "Không hài lòng", 1: "Rất tệ" }[hoverRating || newReviewRating] || ''
                  })
                </span>
              </div>
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

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Đính kèm hình ảnh (Không bắt buộc)</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              style={{ fontSize: '0.8rem', color: '#4b5563', padding: '0.4rem 0' }}
            />
            {actualImageBase64 && (
              <div style={{ marginTop: '0.5rem', position: 'relative', display: 'inline-block' }}>
                <img src={actualImageBase64} alt="Preview" style={{ height: '80px', borderRadius: '4px', border: '1px solid #e5e7eb' }} />
                <button 
                  type="button" 
                  onClick={() => { setActualImageBase64(''); setActualMimeType(''); }}
                  style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ✕
                </button>
              </div>
            )}
            <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.3rem' }}>
              📸 Đăng tải hình ảnh thực tế giúp đánh giá của bạn hữu ích hơn.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button 
              type="submit" 
              className="btn btn-primary btn-sm" 
              disabled={isSubmittingUpdate}
              style={{ padding: '0.5rem 1.5rem' }}
            >
              {isSubmittingUpdate ? "Đang lưu..." : isEditing ? "Lưu cập nhật" : "Gửi đánh giá"}
            </button>
            {isEditing && (
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="btn btn-ghost btn-sm"
                style={{ padding: '0.5rem 1rem', background: '#f3f4f6', border: '1px solid #d1d5db', color: '#374151', borderRadius: '6px', cursor: 'pointer' }}
              >
                Hủy bỏ
              </button>
            )}
          </div>
        </form>
        )}

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

              const backendUrl = (import.meta as any).env?.VITE_MEDUSA_BACKEND_URL || 'http://localhost:9000';
              let avatarSrc = (rev as any).user_avatar || (rev as any).avatar_url || "";
              if (avatarSrc && avatarSrc.startsWith('/')) {
                avatarSrc = `${backendUrl}${avatarSrc}`;
              }

              return (
                <div key={idx} style={{ display: 'flex', gap: '1rem', paddingBottom: '1.2rem', borderBottom: '1px solid #f0f0f0' }}>
                  {/* Avatar */}
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={name}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        flexShrink: 0,
                        border: '1px solid #c7d2fe'
                      }}
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                        if (e.currentTarget.nextElementSibling) {
                          (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    background: '#e0e7ff', 
                    color: 'var(--indigo, #4f46e5)', 
                    display: avatarSrc ? 'none' : 'flex', 
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
                    <p style={{ fontSize: '0.85rem', color: '#444', lineHeight: '1.6', marginBottom: (rev as any).images?.length ? '0.5rem' : '0' }}>{rev.comment}</p>
                    
                    {/* Render attached images */}
                    {(rev as any).images && (rev as any).images.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {(rev as any).images.map((imgUrl: string, i: number) => (
                          <img 
                            key={i}
                            src={imgUrl} 
                            alt="Review attachment" 
                            style={{ height: '70px', width: '70px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #eaeaea' }} 
                            onClick={() => window.open(imgUrl, '_blank')}
                          />
                        ))}
                      </div>
                    )}
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
