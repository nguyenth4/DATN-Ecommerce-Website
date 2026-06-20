import { Search, Download, Eye, Pencil, Printer, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const OrdersPage = () => {
  const [filter, setFilter] = useState('all');

  return (
    <div className="admin-content" style={{ marginLeft: 0 }}>
      {/* STATUS TABS */}
      <div className="flex-center" style={{ gap: 0, borderBottom: '2px solid var(--border)', marginBottom: '1.2rem', overflowX: 'auto' }}>
        <button onClick={() => setFilter('all')} className={`tab-btn ${filter === 'all' ? 'active' : ''}`} style={{ whiteSpace: 'nowrap' }}>Tất cả (1,284)</button>
        <button onClick={() => setFilter('pending')} className={`tab-btn ${filter === 'pending' ? 'active' : ''}`} style={{ whiteSpace: 'nowrap' }}>Chờ xác nhận (127)</button>
        <button onClick={() => setFilter('processing')} className={`tab-btn ${filter === 'processing' ? 'active' : ''}`} style={{ whiteSpace: 'nowrap' }}>Đang xử lý (84)</button>
        <button onClick={() => setFilter('shipped')} className={`tab-btn ${filter === 'shipped' ? 'active' : ''}`} style={{ whiteSpace: 'nowrap' }}>Đang giao (203)</button>
        <button onClick={() => setFilter('delivered')} className={`tab-btn ${filter === 'delivered' ? 'active' : ''}`} style={{ whiteSpace: 'nowrap' }}>Đã giao (862)</button>
        <button onClick={() => setFilter('cancelled')} className={`tab-btn ${filter === 'cancelled' ? 'active' : ''}`} style={{ whiteSpace: 'nowrap' }}>Đã hủy (8)</button>
      </div>

      {/* FILTER ROW */}
      <div className="admin-card" style={{ marginBottom: '1rem' }}>
        <div className="admin-card-body admin-card-body-compact">
          <div className="flex-center" style={{ gap: '0.8rem', flexWrap: 'wrap' }}>
            <div className="admin-search">
              <Search size={16} />
              <input type="text" placeholder="Mã đơn, tên khách..." />
            </div>
            <select className="admin-form-control" style={{ width: '150px', padding: '0.5rem 0.8rem' }}>
              <option>Đơn vị vận chuyển</option>
              <option>GHN</option>
              <option>GHTK</option>
            </select>
            <select className="admin-form-control" style={{ width: '150px', padding: '0.5rem 0.8rem' }}>
              <option>Thanh toán</option>
              <option>VNPay</option>
              <option>MoMo</option>
              <option>ZaloPay</option>
              <option>COD</option>
            </select>
            <input type="date" className="admin-form-control" style={{ width: '150px', padding: '0.5rem 0.8rem' }} />
            <button className="admin-btn admin-btn-outline admin-btn-sm"><Download size={16} /> Xuất Excel</button>
          </div>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="admin-card">
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th><input type="checkbox" className="admin-checkbox" /></th>
                <th>Mã đơn hàng</th>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Tổng tiền</th>
                <th>Vận chuyển</th>
                <th>Thanh toán</th>
                <th>Ngày đặt</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><input type="checkbox" className="admin-checkbox" /></td>
                <td><span className="order-code">#SF2025-8842</span></td>
                <td>
                  <div className="td-avatar-row">
                    <div className="review-avatar" style={{ width: '26px', height: '26px', fontSize: '0.6rem', background: 'var(--accent)' }}>TN</div>
                    <div>
                      <div className="customer-name-cell">Trần Ngọc</div>
                      <div className="td-muted text-xs">0912 345 678</div>
                    </div>
                  </div>
                </td>
                <td className="td-muted">Sony WH-1000XM5 × 1</td>
                <td className="td-price">8.490.000đ</td>
                <td style={{ fontSize: '0.78rem' }}>
                  <div style={{ fontWeight: 600 }}>GHN</div>
                  <div className="td-muted">GHN24050001</div>
                </td>
                <td><span className="status-badge badge-delivered" style={{ fontSize: '0.68rem' }}>Đã thanh toán</span><div className="td-muted" style={{ marginTop: '0.2rem' }}>VNPay</div></td>
                <td className="td-muted">24/05/2025<br/>09:32</td>
                <td><span className="status-badge badge-processing">Đang xử lý</span></td>
                <td>
                  <div className="action-btns">
                    <button className="action-btn view" title="Chi tiết"><Eye size={16} /></button>
                    <button className="action-btn edit" title="Chỉnh sửa"><Pencil size={16} /></button>
                    <button className="action-btn" title="In vận đơn" style={{ color: 'var(--info)' }}><Printer size={16} /></button>
                  </div>
                </td>
              </tr>
              <tr>
                <td><input type="checkbox" className="admin-checkbox" /></td>
                <td><span className="order-code">#SF2025-8841</span></td>
                <td>
                  <div className="td-avatar-row">
                    <div className="review-avatar" style={{ width: '26px', height: '26px', fontSize: '0.6rem' }}>MH</div>
                    <div>
                      <div className="customer-name-cell">Minh Hoàng</div>
                      <div className="td-muted text-xs">0987 654 321</div>
                    </div>
                  </div>
                </td>
                <td className="td-muted">iPhone 16 Pro × 1,<br/>AirPods Pro × 1</td>
                <td className="td-price">32.840.000đ</td>
                <td style={{ fontSize: '0.78rem' }}>
                  <div style={{ fontWeight: 600 }}>GHTK</div>
                  <div className="td-muted">Chưa tạo</div>
                </td>
                <td><span className="status-badge badge-pending" style={{ fontSize: '0.68rem' }}>Chờ thanh toán</span><div className="td-muted" style={{ marginTop: '0.2rem' }}>COD</div></td>
                <td className="td-muted">24/05/2025<br/>08:15</td>
                <td><span className="status-badge badge-pending">Chờ xác nhận</span></td>
                <td>
                  <div className="action-btns">
                    <button className="action-btn view"><Eye size={16} /></button>
                    <button className="action-btn edit"><Pencil size={16} /></button>
                    <button className="action-btn" title="Xác nhận" style={{ color: 'var(--success)' }}><Check size={16} /></button>
                  </div>
                </td>
              </tr>
              <tr>
                <td><input type="checkbox" className="admin-checkbox" /></td>
                <td><span className="order-code">#SF2025-8840</span></td>
                <td>
                  <div className="td-avatar-row">
                    <div className="review-avatar" style={{ width: '26px', height: '26px', fontSize: '0.6rem', background: '#3B82F6' }}>LT</div>
                    <div>
                      <div className="customer-name-cell">Lan Trinh</div>
                      <div className="td-muted text-xs">0901 234 567</div>
                    </div>
                  </div>
                </td>
                <td className="td-muted">MacBook Pro M3 × 1</td>
                <td className="td-price">42.990.000đ</td>
                <td style={{ fontSize: '0.78rem' }}>
                  <div style={{ fontWeight: 600 }}>GHN</div>
                  <div style={{ color: 'var(--info)' }}>GHN24049998</div>
                </td>
                <td><span className="status-badge badge-delivered" style={{ fontSize: '0.68rem' }}>Đã thanh toán</span><div className="td-muted" style={{ marginTop: '0.2rem' }}>MoMo</div></td>
                <td className="td-muted">23/05/2025<br/>14:22</td>
                <td><span className="status-badge badge-shipped">Đang giao</span></td>
                <td>
                  <div className="action-btns">
                    <button className="action-btn view"><Eye size={16} /></button>
                    <button className="action-btn edit"><Pencil size={16} /></button>
                    <button className="action-btn" title="In vận đơn" style={{ color: 'var(--info)' }}><Printer size={16} /></button>
                  </div>
                </td>
              </tr>
              <tr>
                <td><input type="checkbox" className="admin-checkbox" /></td>
                <td><span className="order-code">#SF2025-8839</span></td>
                <td>
                  <div className="td-avatar-row">
                    <div className="review-avatar" style={{ width: '26px', height: '26px', fontSize: '0.6rem', background: '#22C55E' }}>PD</div>
                    <div>
                      <div className="customer-name-cell">Phương Dung</div>
                      <div className="td-muted text-xs">0913 456 789</div>
                    </div>
                  </div>
                </td>
                <td className="td-muted">Apple Watch Ultra 2 × 1</td>
                <td className="td-price">19.990.000đ</td>
                <td style={{ fontSize: '0.78rem' }}>
                  <div style={{ fontWeight: 600 }}>GHN</div>
                  <div style={{ color: 'var(--success)' }}>GHN24049995 ✓</div>
                </td>
                <td><span className="status-badge badge-delivered" style={{ fontSize: '0.68rem' }}>Đã thanh toán</span><div className="td-muted" style={{ marginTop: '0.2rem' }}>ZaloPay</div></td>
                <td className="td-muted">23/05/2025<br/>10:05</td>
                <td><span className="status-badge badge-delivered">Đã giao</span></td>
                <td>
                  <div className="action-btns">
                    <button className="action-btn view"><Eye size={16} /></button>
                    <button className="action-btn edit"><Pencil size={16} /></button>
                  </div>
                </td>
              </tr>
              <tr>
                <td><input type="checkbox" className="admin-checkbox" /></td>
                <td><span className="order-code">#SF2025-8838</span></td>
                <td>
                  <div className="td-avatar-row">
                    <div className="review-avatar" style={{ width: '26px', height: '26px', fontSize: '0.6rem', background: '#F59E0B' }}>QA</div>
                    <div>
                      <div className="customer-name-cell">Quốc Anh</div>
                      <div className="td-muted text-xs">0905 678 901</div>
                    </div>
                  </div>
                </td>
                <td className="td-muted">PS5 DualSense Edge × 1</td>
                <td className="td-price">3.290.000đ</td>
                <td className="td-muted">—</td>
                <td><span className="status-badge badge-cancelled" style={{ fontSize: '0.68rem' }}>Hoàn tiền</span><div className="td-muted" style={{ marginTop: '0.2rem' }}>VNPay</div></td>
                <td className="td-muted">22/05/2025<br/>16:45</td>
                <td><span className="status-badge badge-cancelled">Đã hủy</span></td>
                <td>
                  <div className="action-btns">
                    <button className="action-btn view"><Eye size={16} /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span className="table-footer-info">Hiển thị 1–5 / 1,284 đơn hàng</span>
          <div className="pagination">
            <button className="page-btn"><ChevronLeft size={14} /></button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <span className="page-ellipsis">...</span>
            <button className="page-btn">257</button>
            <button className="page-btn"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
