import React, { useState } from 'react';
import { 
  Upload, Download, Plus, Search, X, EyeOff, Trash2, Eye, 
  Pencil, Image as ImageIcon, ChevronLeft, ChevronRight, 
  CloudUpload, Check 
} from 'lucide-react';
import './ProductsPage.css';

const ProductsPage = () => {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="products-page">
      {/* HEADER ROW */}
      <div className="admin-page-header">
        <div>
          <div className="admin-page-header-meta">3,847 sản phẩm đang hoạt động</div>
        </div>
        <div className="admin-page-header-actions">
          <button className="admin-btn admin-btn-outline"><Upload size={16} /> Import</button>
          <button className="admin-btn admin-btn-outline"><Download size={16} /> Export</button>
          <button className="admin-btn admin-btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Thêm sản phẩm
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="admin-card" style={{ marginBottom: '1rem' }}>
        <div className="filter-bar-body">
          <div className="filter-bar-row">
            <div className="admin-search" style={{ flex: 1, minWidth: '200px' }}>
              <Search size={16} />
              <input type="text" placeholder="Tìm theo tên, SKU..." style={{ width: '100%' }} />
            </div>
            <select className="admin-form-control filter-select" style={{ width: '160px' }}>
              <option>Tất cả danh mục</option>
              <option>Điện thoại</option>
              <option>Laptop</option>
              <option>Tai nghe</option>
              <option>Smartwatch</option>
              <option>Loa</option>
            </select>
            <select className="admin-form-control filter-select" style={{ width: '140px' }}>
              <option>Tất cả trạng thái</option>
              <option>Đang bán</option>
              <option>Chờ duyệt</option>
              <option>Tạm ẩn</option>
            </select>
            <select className="admin-form-control filter-select" style={{ width: '160px' }}>
              <option>Sắp xếp: Mới nhất</option>
              <option>Giá: Thấp → Cao</option>
              <option>Giá: Cao → Thấp</option>
              <option>Bán chạy nhất</option>
            </select>
            <button className="admin-btn admin-btn-outline"><X size={16} /> Xóa lọc</button>
          </div>
        </div>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="select-all-wrap">
            <input type="checkbox" id="selectAll" className="admin-checkbox-lg" />
            <span className="select-all-label">Chọn tất cả</span>
          </div>
          <div className="admin-page-header-actions">
            <button className="admin-btn admin-btn-outline admin-btn-sm"><EyeOff size={16} /> Ẩn đã chọn</button>
            <button className="admin-btn admin-btn-danger admin-btn-sm"><Trash2 size={16} /> Xóa đã chọn</button>
          </div>
        </div>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '36px' }}></th>
                <th>Sản phẩm</th>
                <th>Danh mục</th>
                <th>Biến thể</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Đã bán</th>
                <th>Trạng thái</th>
                <th style={{ width: '80px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><input type="checkbox" className="admin-checkbox" /></td>
                <td>
                  <div className="td-avatar-row">
                    <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&q=60" alt="" className="admin-product-img" />
                    <div>
                      <div className="product-name-cell">Sony WH-1000XM5</div>
                      <div className="product-sku-cell">SKU: SNY-WH1000XM5</div>
                    </div>
                  </div>
                </td>
                <td className="td-muted">Tai nghe</td>
                <td className="td-muted"><span className="variant-chip">4 màu</span></td>
                <td className="td-price">8.490.000đ</td>
                <td className="td-muted"><span style={{ color: 'var(--success)' }}>● 48</span></td>
                <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>312</td>
                <td><span className="status-badge badge-active">Đang bán</span></td>
                <td>
                  <div className="action-btns">
                    <button className="action-btn view" title="Xem"><Eye size={16} /></button>
                    <button className="action-btn edit" title="Sửa"><Pencil size={16} /></button>
                    <button className="action-btn delete" title="Xóa"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
              <tr>
                <td><input type="checkbox" className="admin-checkbox" /></td>
                <td>
                  <div className="td-avatar-row">
                    <img src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=80&q=60" alt="" className="admin-product-img" />
                    <div>
                      <div className="product-name-cell">iPhone 16 Pro</div>
                      <div className="product-sku-cell">SKU: APL-IP16PRO</div>
                    </div>
                  </div>
                </td>
                <td className="td-muted">Điện thoại</td>
                <td className="td-muted">
                  <span className="variant-chip">3 màu × 3 dung lượng</span>
                </td>
                <td className="td-price">26.990.000đ</td>
                <td className="td-muted"><span style={{ color: 'var(--warning)' }}>● 5</span></td>
                <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>287</td>
                <td><span className="status-badge badge-active">Đang bán</span></td>
                <td>
                  <div className="action-btns">
                    <button className="action-btn view"><Eye size={16} /></button>
                    <button className="action-btn edit"><Pencil size={16} /></button>
                    <button className="action-btn delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
              <tr>
                <td><input type="checkbox" className="admin-checkbox" /></td>
                <td>
                  <div className="td-avatar-row">
                    <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&q=60" alt="" className="admin-product-img" />
                    <div>
                      <div className="product-name-cell">Apple Watch Ultra 2</div>
                      <div className="product-sku-cell">SKU: APL-AW-ULTRA2</div>
                    </div>
                  </div>
                </td>
                <td className="td-muted">Smartwatch</td>
                <td className="td-muted"><span className="variant-chip">2 dây</span></td>
                <td className="td-price">19.990.000đ</td>
                <td className="td-muted"><span style={{ color: 'var(--success)' }}>● 32</span></td>
                <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>198</td>
                <td><span className="status-badge badge-active">Đang bán</span></td>
                <td>
                  <div className="action-btns">
                    <button className="action-btn view"><Eye size={16} /></button>
                    <button className="action-btn edit"><Pencil size={16} /></button>
                    <button className="action-btn delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
              <tr>
                <td><input type="checkbox" className="admin-checkbox" /></td>
                <td>
                  <div className="td-avatar-row">
                    <img src="https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=80&q=60" alt="" className="admin-product-img" />
                    <div>
                      <div className="product-name-cell">MacBook Pro M3 14"</div>
                      <div className="product-sku-cell">SKU: APL-MBP-M3-14</div>
                    </div>
                  </div>
                </td>
                <td className="td-muted">Laptop</td>
                <td className="td-muted"><span className="variant-chip">2 cấu hình</span></td>
                <td className="td-price">42.990.000đ</td>
                <td className="td-muted"><span style={{ color: 'var(--success)' }}>● 18</span></td>
                <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>154</td>
                <td><span className="status-badge badge-active">Đang bán</span></td>
                <td>
                  <div className="action-btns">
                    <button className="action-btn view"><Eye size={16} /></button>
                    <button className="action-btn edit"><Pencil size={16} /></button>
                    <button className="action-btn delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
              <tr>
                <td><input type="checkbox" className="admin-checkbox" /></td>
                <td>
                  <div className="td-avatar-row">
                    <img src="https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=80&q=60" alt="" className="admin-product-img" />
                    <div>
                      <div className="product-name-cell">JBL Charge 5</div>
                      <div className="product-sku-cell">SKU: JBL-CHARGE5</div>
                    </div>
                  </div>
                </td>
                <td className="td-muted">Loa</td>
                <td className="td-muted"><span className="variant-chip">5 màu</span></td>
                <td className="td-price">3.400.000đ</td>
                <td className="td-muted"><span style={{ color: 'var(--danger)' }}>● 2</span></td>
                <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>89</td>
                <td><span className="status-badge badge-active">Đang bán</span></td>
                <td>
                  <div className="action-btns">
                    <button className="action-btn view"><Eye size={16} /></button>
                    <button className="action-btn edit"><Pencil size={16} /></button>
                    <button className="action-btn delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
              <tr>
                <td><input type="checkbox" className="admin-checkbox" /></td>
                <td>
                  <div className="td-avatar-row">
                    <div className="admin-product-img" style={{ background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray)' }}><ImageIcon size={24} /></div>
                    <div>
                      <div className="product-name-cell">Xiaomi Pad 7 Pro</div>
                      <div className="product-sku-cell">SKU: XMI-PAD7PRO</div>
                    </div>
                  </div>
                </td>
                <td className="td-muted">Máy tính bảng</td>
                <td className="td-muted"><span className="variant-chip">2 màu × 2 bộ nhớ</span></td>
                <td className="td-price">9.990.000đ</td>
                <td className="td-muted"><span style={{ color: 'var(--gray)' }}>● 0</span></td>
                <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>0</td>
                <td><span className="status-badge badge-pending">Chờ duyệt</span></td>
                <td>
                  <div className="action-btns">
                    <button className="action-btn view"><Eye size={16} /></button>
                    <button className="action-btn edit"><Pencil size={16} /></button>
                    <button className="action-btn delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span className="table-footer-info">Hiển thị 1–6 / 3,847 sản phẩm</span>
          <div className="pagination">
            <button className="page-btn"><ChevronLeft size={16} /></button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <span className="page-ellipsis">...</span>
            <button className="page-btn">385</button>
            <button className="page-btn"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* ADD PRODUCT MODAL */}
      {showAddModal && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal-box">
            <div className="modal-header">
              <div className="modal-title">Thêm sản phẩm mới</div>
              <button onClick={() => setShowAddModal(false)} className="modal-close"><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="admin-form-group">
                <label className="admin-form-label">Tên sản phẩm *</label>
                <input type="text" className="admin-form-control" placeholder="Nhập tên sản phẩm..." />
              </div>
              <div className="grid-2">
                <div className="admin-form-group">
                  <label className="admin-form-label">Danh mục *</label>
                  <select className="admin-form-control">
                    <option>Chọn danh mục...</option>
                    <option>Điện thoại</option>
                    <option>Laptop</option>
                    <option>Tai nghe</option>
                    <option>Smartwatch</option>
                    <option>Loa</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Giá gốc (đ) *</label>
                  <input type="number" className="admin-form-control" placeholder="0" />
                </div>
              </div>
              <div className="grid-2">
                <div className="admin-form-group">
                  <label className="admin-form-label">Giá giảm (đ)</label>
                  <input type="number" className="admin-form-control" placeholder="Để trống nếu không giảm" />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Trọng lượng (gram)</label>
                  <input type="number" className="admin-form-control" placeholder="Dùng tính phí ship" />
                </div>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Mô tả sản phẩm</label>
                <textarea className="admin-form-control" rows={3} placeholder="Mô tả chi tiết sản phẩm..."></textarea>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Thuộc tính biến thể</label>
                <div className="variant-input-row">
                  <select className="admin-form-control" style={{ flex: 1 }}>
                    <option>Màu sắc</option>
                    <option>Kích cỡ</option>
                    <option>Dung lượng</option>
                    <option>Chất liệu</option>
                  </select>
                  <input type="text" className="admin-form-control" style={{ flex: 2 }} placeholder="Giá trị (vd: Đen, Trắng, Xanh)" />
                  <button className="admin-btn admin-btn-outline"><Plus size={16} /></button>
                </div>
                <div className="variant-tag-list">
                  <span className="variant-tag">Đen <X size={14} /></span>
                  <span className="variant-tag">Trắng <X size={14} /></span>
                </div>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Hình ảnh sản phẩm</label>
                <div className="upload-zone-lg">
                  <CloudUpload size={48} className="upload-zone-lg-icon" />
                  <div className="upload-zone-lg-title">Kéo thả ảnh vào đây</div>
                  <div className="upload-zone-lg-hint">hoặc click để chọn file (JPG, PNG, tối đa 5MB)</div>
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowAddModal(false)} className="admin-btn admin-btn-outline">Hủy</button>
                <button className="admin-btn admin-btn-primary"><Check size={16} /> Thêm sản phẩm</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
