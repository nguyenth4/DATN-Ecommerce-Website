import { Plus, Copy, Pencil, Trash2, Eye, RefreshCcw, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const CouponsPage = () => {
  const [showForm, setShowForm] = useState(true);

  return (
    <div className="admin-content" style={{ marginLeft: 0 }}>
      <div className="dash-grid">
        {/* LEFT: TABLE */}
        <div>
          <div className="admin-page-header">
            <div className="admin-page-header-meta">24 mã giảm giá</div>
            <button className="admin-btn admin-btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={16} /> Tạo mã mới
            </button>
          </div>

          {/* FILTER TABS */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.2rem', overflowX: 'auto' }}>
            <button className="tab-btn active" style={{ whiteSpace: 'nowrap' }}>Tất cả (24)</button>
            <button className="tab-btn" style={{ whiteSpace: 'nowrap' }}>Đang hoạt động (12)</button>
            <button className="tab-btn" style={{ whiteSpace: 'nowrap' }}>Hết hạn (10)</button>
            <button className="tab-btn" style={{ whiteSpace: 'nowrap' }}>Tạm ẩn (2)</button>
          </div>

          <div className="admin-card">
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Mã coupon</th>
                    <th>Loại giảm</th>
                    <th>Giá trị</th>
                    <th>Đơn tối thiểu</th>
                    <th>Đã dùng / Giới hạn</th>
                    <th>Hết hạn</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="td-avatar-row">
                        <span className="coupon-code-badge">WELCOME100</span>
                        <button className="action-btn-link" title="Sao chép"><Copy size={14} /></button>
                      </div>
                    </td>
                    <td><span className="coupon-type-badge">Cố định</span></td>
                    <td className="td-price">100.000đ</td>
                    <td className="td-phone">500.000đ</td>
                    <td>
                      <div className="fw-600" style={{ fontSize: '0.82rem' }}>241 / 500</div>
                      <div className="progress-bar-wrap">
                        <div className="progress-bar-fill" style={{ width: '48%', background: 'var(--info)' }}></div>
                      </div>
                    </td>
                    <td className="td-muted">31/12/2025</td>
                    <td><span className="status-badge badge-active">Hoạt động</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="action-btn edit"><Pencil size={16} /></button>
                        <button className="action-btn delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="td-avatar-row">
                        <span className="coupon-code-badge">SALE20</span>
                        <button className="action-btn-link" title="Sao chép"><Copy size={14} /></button>
                      </div>
                    </td>
                    <td><span className="coupon-type-badge percent">Phần trăm</span></td>
                    <td className="td-price">20%</td>
                    <td className="td-phone">2.000.000đ</td>
                    <td>
                      <div className="fw-600" style={{ fontSize: '0.82rem' }}>89 / 200</div>
                      <div className="progress-bar-wrap">
                        <div className="progress-bar-fill" style={{ width: '44%', background: 'var(--accent)' }}></div>
                      </div>
                    </td>
                    <td className="td-muted">30/06/2025</td>
                    <td><span className="status-badge badge-active">Hoạt động</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="action-btn edit"><Pencil size={16} /></button>
                        <button className="action-btn delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="td-avatar-row">
                        <span className="coupon-code-badge">FREESHIP</span>
                        <button className="action-btn-link" title="Sao chép"><Copy size={14} /></button>
                      </div>
                    </td>
                    <td><span className="coupon-type-badge shipping">Phí ship</span></td>
                    <td className="td-price">Miễn phí</td>
                    <td className="td-phone">1.000.000đ</td>
                    <td>
                      <div className="fw-600" style={{ fontSize: '0.82rem' }}>512 / ∞</div>
                      <div className="progress-bar-wrap">
                        <div className="progress-bar-fill" style={{ width: '20%', background: 'var(--success)' }}></div>
                      </div>
                    </td>
                    <td className="td-muted">31/12/2025</td>
                    <td><span className="status-badge badge-active">Hoạt động</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="action-btn edit"><Pencil size={16} /></button>
                        <button className="action-btn delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                  <tr style={{ opacity: 0.6 }}>
                    <td>
                      <div className="td-avatar-row">
                        <span className="coupon-code-badge" style={{ color: 'var(--gray)' }}>TET2025</span>
                      </div>
                    </td>
                    <td><span className="coupon-type-badge percent">Phần trăm</span></td>
                    <td className="td-price">30%</td>
                    <td className="td-phone">3.000.000đ</td>
                    <td>
                      <div className="fw-600" style={{ fontSize: '0.82rem' }}>1000 / 1000</div>
                      <div className="progress-bar-wrap">
                        <div className="progress-bar-fill" style={{ width: '100%', background: 'var(--danger)' }}></div>
                      </div>
                    </td>
                    <td className="td-muted" style={{ color: 'var(--danger)', fontWeight: 600 }}>Hết hạn</td>
                    <td><span className="status-badge badge-cancelled">Hết hạn</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="action-btn view"><Eye size={16} /></button>
                        <button className="action-btn delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <span className="table-footer-info">Hiển thị 1–4 / 24 mã</span>
              <div className="pagination">
                <button className="page-btn"><ChevronLeft size={14} /></button>
                <button className="page-btn active">1</button>
                <button className="page-btn">2</button>
                <button className="page-btn">3</button>
                <button className="page-btn"><ChevronRight size={14} /></button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: FORM */}
        {showForm && (
          <div id="couponForm">
            <div className="admin-card">
              <div className="admin-card-header">
                <div className="admin-card-title">Tạo mã giảm giá mới</div>
              </div>
              <div className="admin-card-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Mã coupon *</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="text" className="admin-form-control coupon-code-input" id="couponCode" placeholder="VD: SALE20" />
                    <button className="admin-btn admin-btn-outline" title="Tạo ngẫu nhiên"><RefreshCcw size={16} /></button>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Loại giảm giá *</label>
                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <label className="form-radio-card">
                      <input type="radio" name="dtype" value="percent" defaultChecked /> Phần trăm (%)
                    </label>
                    <label className="form-radio-card">
                      <input type="radio" name="dtype" value="fixed" /> Cố định (đ)
                    </label>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Giá trị giảm *</label>
                    <input type="number" className="admin-form-control" placeholder="20" />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Giảm tối đa (đ)</label>
                    <input type="number" className="admin-form-control" placeholder="500.000" />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Đơn hàng tối thiểu (đ)</label>
                  <input type="number" className="admin-form-control" placeholder="Để trống = không giới hạn" />
                </div>

                <div className="grid-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Giới hạn lượt dùng</label>
                    <input type="number" className="admin-form-control" placeholder="Để trống = vô hạn" />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Mỗi người tối đa</label>
                    <input type="number" className="admin-form-control" placeholder="1" defaultValue="1" />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Ngày bắt đầu</label>
                    <input type="datetime-local" className="admin-form-control" />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Ngày hết hạn</label>
                    <input type="datetime-local" className="admin-form-control" />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Trạng thái</label>
                  <div className="form-radio-group">
                    <label className="form-radio-label">
                      <input type="radio" name="cStatus" value="1" defaultChecked className="admin-checkbox" /> Hoạt động
                    </label>
                    <label className="form-radio-label">
                      <input type="radio" name="cStatus" value="0" className="admin-checkbox" /> Tạm ẩn
                    </label>
                  </div>
                </div>

                {/* PREVIEW */}
                <div className="coupon-preview-card">
                  <div className="coupon-preview-title">Xem trước</div>
                  <div className="coupon-preview-body">
                    <div className="coupon-preview-code">SALE20</div>
                    <div>
                      <div className="coupon-preview-details">Giảm 20% (tối đa 500K)</div>
                      <div className="coupon-preview-sub">Đơn từ 2.000.000đ • HSD: 30/06/2025</div>
                    </div>
                  </div>
                </div>

                <div className="form-action-row">
                  <button className="admin-btn admin-btn-primary" style={{ flex: 1 }}><Check size={16} /> Tạo mã</button>
                  <button className="admin-btn admin-btn-outline" onClick={() => setShowForm(false)}>Hủy</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponsPage;
