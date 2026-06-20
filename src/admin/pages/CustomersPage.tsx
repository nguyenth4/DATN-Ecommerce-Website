import { Search, Download, Eye, Pencil, Lock, Unlock, Trash2, ChevronLeft, ChevronRight, Users, UserCheck, UserPlus, UserX, ArrowUp, ArrowDown } from 'lucide-react';

const CustomersPage = () => {
  return (
    <div className="admin-content" style={{ marginLeft: 0 }}>
      {/* STAT CARDS */}
      <div className="stats-grid stats-grid-4">
        <div className="stat-card">
          <div className="stat-icon blue"><Users size={20} /></div>
          <div>
            <div className="stat-value">8,492</div>
            <div className="stat-label">Tổng khách hàng</div>
            <div className="stat-trend up"><ArrowUp size={14} /> +241 tháng này</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><UserCheck size={20} /></div>
          <div>
            <div className="stat-value">7,814</div>
            <div className="stat-label">Đang hoạt động</div>
            <div className="stat-trend up"><ArrowUp size={14} /> 92% tỉ lệ</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><UserPlus size={20} /></div>
          <div>
            <div className="stat-value">241</div>
            <div className="stat-label">Khách mới tháng này</div>
            <div className="stat-trend up"><ArrowUp size={14} /> +18% so với tháng trước</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><UserX size={20} /></div>
          <div>
            <div className="stat-value">678</div>
            <div className="stat-label">Bị khóa / Không hoạt động</div>
            <div className="stat-trend down"><ArrowDown size={14} /> 8% tỉ lệ</div>
          </div>
        </div>
      </div>

      {/* FILTER */}
      <div className="admin-card" style={{ marginBottom: '1rem' }}>
        <div className="filter-bar-body">
          <div className="filter-bar-row">
            <div className="admin-search" style={{ flex: 1, minWidth: '200px' }}>
              <Search size={16} />
              <input type="text" placeholder="Tên, email, số điện thoại..." style={{ width: '100%' }} />
            </div>
            <select className="admin-form-control filter-select" style={{ width: '150px' }}>
              <option>Tất cả trạng thái</option>
              <option>Hoạt động</option>
              <option>Bị khóa</option>
            </select>
            <select className="admin-form-control filter-select" style={{ width: '160px' }}>
              <option>Sắp xếp: Mới nhất</option>
              <option>Chi tiêu: Cao nhất</option>
              <option>Đơn hàng: Nhiều nhất</option>
            </select>
            <button className="admin-btn admin-btn-outline"><Download size={16} /> Xuất Excel</button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="admin-card">
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th><input type="checkbox" className="admin-checkbox" /></th>
                <th>Khách hàng</th>
                <th>Email</th>
                <th>Số ĐT</th>
                <th>Đơn hàng</th>
                <th>Tổng chi tiêu</th>
                <th>Ngày đăng ký</th>
                <th>Đăng nhập gần nhất</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><input type="checkbox" className="admin-checkbox" /></td>
                <td>
                  <div className="td-avatar-row">
                    <div className="review-avatar" style={{ background: 'var(--accent)' }}>TN</div>
                    <div>
                      <div className="customer-name-cell">Trần Ngọc</div>
                      <div className="customer-id-cell">ID: #C00001</div>
                    </div>
                  </div>
                </td>
                <td className="td-muted">tran.ngoc@email.com</td>
                <td className="td-muted">0912 345 678</td>
                <td style={{ fontWeight: 700, textAlign: 'center' }}>5</td>
                <td className="td-price">42.500.000đ</td>
                <td className="td-muted">20/05/2025</td>
                <td className="td-muted">Hôm nay</td>
                <td><span className="status-badge badge-active">Hoạt động</span></td>
                <td>
                  <div className="action-btns">
                    <button className="action-btn view" title="Xem chi tiết"><Eye size={16} /></button>
                    <button className="action-btn edit" title="Chỉnh sửa"><Pencil size={16} /></button>
                    <button className="action-btn" title="Khóa tài khoản" style={{ color: 'var(--warning)' }}><Lock size={16} /></button>
                  </div>
                </td>
              </tr>
              <tr>
                <td><input type="checkbox" className="admin-checkbox" /></td>
                <td>
                  <div className="td-avatar-row">
                    <div className="review-avatar">MH</div>
                    <div>
                      <div className="customer-name-cell">Minh Hoàng</div>
                      <div className="customer-id-cell">ID: #C00002</div>
                    </div>
                  </div>
                </td>
                <td className="td-muted">mhoang@gmail.com</td>
                <td className="td-muted">0987 654 321</td>
                <td style={{ fontWeight: 700, textAlign: 'center' }}>2</td>
                <td className="td-price">18.990.000đ</td>
                <td className="td-muted">22/05/2025</td>
                <td className="td-muted">1 ngày trước</td>
                <td><span className="status-badge badge-active">Hoạt động</span></td>
                <td>
                  <div className="action-btns">
                    <button className="action-btn view"><Eye size={16} /></button>
                    <button className="action-btn edit"><Pencil size={16} /></button>
                    <button className="action-btn" style={{ color: 'var(--warning)' }}><Lock size={16} /></button>
                  </div>
                </td>
              </tr>
              <tr>
                <td><input type="checkbox" className="admin-checkbox" /></td>
                <td>
                  <div className="td-avatar-row">
                    <div className="review-avatar" style={{ background: '#22C55E' }}>PD</div>
                    <div>
                      <div className="customer-name-cell">Phương Dung</div>
                      <div className="customer-id-cell">ID: #C00003</div>
                    </div>
                  </div>
                </td>
                <td className="td-muted">pdung2001@email.com</td>
                <td className="td-muted">0901 234 567</td>
                <td style={{ fontWeight: 700, textAlign: 'center' }}>8</td>
                <td className="td-price">89.450.000đ</td>
                <td className="td-muted">01/01/2025</td>
                <td className="td-muted">2 giờ trước</td>
                <td><span className="status-badge badge-active">Hoạt động</span></td>
                <td>
                  <div className="action-btns">
                    <button className="action-btn view"><Eye size={16} /></button>
                    <button className="action-btn edit"><Pencil size={16} /></button>
                    <button className="action-btn" style={{ color: 'var(--warning)' }}><Lock size={16} /></button>
                  </div>
                </td>
              </tr>
              <tr style={{ opacity: 0.7 }}>
                <td><input type="checkbox" className="admin-checkbox" /></td>
                <td>
                  <div className="td-avatar-row">
                    <div className="review-avatar" style={{ background: '#9CA3AF' }}>QA</div>
                    <div>
                      <div className="customer-name-cell">Quốc Anh</div>
                      <div className="customer-id-cell">ID: #C00004</div>
                    </div>
                  </div>
                </td>
                <td className="td-muted">quocanh@email.com</td>
                <td className="td-muted">0905 678 901</td>
                <td style={{ fontWeight: 700, textAlign: 'center' }}>1</td>
                <td className="td-price">3.290.000đ</td>
                <td className="td-muted">18/04/2025</td>
                <td className="td-muted">30 ngày trước</td>
                <td><span className="status-badge badge-inactive">Bị khóa</span></td>
                <td>
                  <div className="action-btns">
                    <button className="action-btn view"><Eye size={16} /></button>
                    <button className="action-btn" title="Mở khóa" style={{ color: 'var(--success)' }}><Unlock size={16} /></button>
                    <button className="action-btn delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span className="table-footer-info">Hiển thị 1–4 / 8,492 khách hàng</span>
          <div className="pagination">
            <button className="page-btn"><ChevronLeft size={14} /></button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <span className="page-ellipsis">...</span>
            <button className="page-btn">850</button>
            <button className="page-btn"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;
