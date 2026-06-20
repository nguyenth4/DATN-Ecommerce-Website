import React, { useState } from 'react';
import { 
  Plus, Search, Smartphone, Laptop, Headphones, 
  Bluetooth, Watch, Gamepad2, Pencil, Trash2, Image as ImageIcon, Check
} from 'lucide-react';
import './CategoriesPage.css';

const CategoriesPage = () => {
  const [showForm, setShowForm] = useState(true);

  return (
    <div className="categories-page">
      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* CATEGORY LIST */}
        <div>
          <div className="admin-page-header">
            <div className="admin-page-header-meta">12 danh mục</div>
            <button 
              className="admin-btn admin-btn-primary" 
              onClick={() => setShowForm(true)}
            >
              <Plus size={16} /> Thêm danh mục
            </button>
          </div>
          <div className="admin-card">
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Danh mục</th>
                    <th>Danh mục cha</th>
                    <th>Sản phẩm</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="td-avatar-row">
                        <div className="cat-icon-cell cat-icon-orange"><Smartphone size={16} /></div>
                        <div>
                          <div className="cat-name-cell">Điện thoại</div>
                          <div className="cat-slug-cell">dien-thoai</div>
                        </div>
                      </div>
                    </td>
                    <td className="td-muted">—</td>
                    <td style={{ fontWeight: 600 }}>142</td>
                    <td><span className="status-badge badge-active">Hiển thị</span></td>
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
                        <div className="cat-icon-cell cat-icon-blue"><Laptop size={16} /></div>
                        <div>
                          <div className="cat-name-cell">Laptop</div>
                          <div className="cat-slug-cell">laptop</div>
                        </div>
                      </div>
                    </td>
                    <td className="td-muted">—</td>
                    <td style={{ fontWeight: 600 }}>89</td>
                    <td><span className="status-badge badge-active">Hiển thị</span></td>
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
                        <div className="cat-icon-cell cat-icon-green"><Headphones size={16} /></div>
                        <div>
                          <div className="cat-name-cell">Tai nghe</div>
                          <div className="cat-slug-cell">tai-nghe</div>
                        </div>
                      </div>
                    </td>
                    <td className="td-muted">—</td>
                    <td style={{ fontWeight: 600 }}>215</td>
                    <td><span className="status-badge badge-active">Hiển thị</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="action-btn edit"><Pencil size={16} /></button>
                        <button className="action-btn delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="td-avatar-row" style={{ paddingLeft: '1rem' }}>
                        <div className="cat-icon-cell cat-icon-green-sub"><Bluetooth size={14} /></div>
                        <div>
                          <div className="cat-name-cell">Tai nghe không dây</div>
                          <div className="cat-slug-cell">tai-nghe-khong-day</div>
                        </div>
                      </div>
                    </td>
                    <td className="td-muted">Tai nghe</td>
                    <td style={{ fontWeight: 600 }}>128</td>
                    <td><span className="status-badge badge-active">Hiển thị</span></td>
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
                        <div className="cat-icon-cell cat-icon-yellow"><Watch size={16} /></div>
                        <div>
                          <div className="cat-name-cell">Smartwatch</div>
                          <div className="cat-slug-cell">smartwatch</div>
                        </div>
                      </div>
                    </td>
                    <td className="td-muted">—</td>
                    <td style={{ fontWeight: 600 }}>67</td>
                    <td><span className="status-badge badge-active">Hiển thị</span></td>
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
                        <div className="cat-icon-cell cat-icon-gray"><Gamepad2 size={16} /></div>
                        <div>
                          <div className="cat-name-cell">Gaming</div>
                          <div className="cat-slug-cell">gaming</div>
                        </div>
                      </div>
                    </td>
                    <td className="td-muted">—</td>
                    <td style={{ fontWeight: 600 }}>94</td>
                    <td><span className="status-badge badge-inactive">Đã ẩn</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="action-btn edit"><Pencil size={16} /></button>
                        <button className="action-btn delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FORM */}
        {showForm && (
          <div id="catForm">
            <div className="admin-card">
              <div className="admin-card-header">
                <div className="admin-card-title">Thêm danh mục mới</div>
              </div>
              <div className="admin-card-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Tên danh mục *</label>
                  <input type="text" className="admin-form-control" placeholder="VD: Điện thoại" />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Slug (URL)</label>
                  <input type="text" className="admin-form-control" placeholder="dien-thoai" />
                  <div className="form-hint">Tự động tạo từ tên nếu để trống</div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Danh mục cha</label>
                  <select className="admin-form-control">
                    <option value="">Không có (danh mục gốc)</option>
                    <option>Điện thoại</option>
                    <option>Laptop</option>
                    <option>Tai nghe</option>
                    <option>Smartwatch</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Biểu tượng (Lucide Icon)</label>
                  <div className="icon-input-wrap">
                    <input type="text" className="admin-form-control icon-input-field" placeholder="Smartphone, Laptop, Headphones..." />
                    <Smartphone className="icon-input-icon" size={16} />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Ảnh danh mục</label>
                  <div className="upload-zone">
                    <ImageIcon className="upload-zone-icon" size={24} />
                    <div className="upload-zone-hint">Click để upload ảnh</div>
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Trạng thái</label>
                  <div className="form-radio-group">
                    <label className="form-radio-label">
                      <input type="radio" name="catStatus" value="1" defaultChecked className="admin-checkbox" /> Hiển thị
                    </label>
                    <label className="form-radio-label">
                      <input type="radio" name="catStatus" value="0" className="admin-checkbox" /> Ẩn
                    </label>
                  </div>
                </div>
                <div className="form-action-row">
                  <button className="admin-btn admin-btn-primary" style={{ flex: 1 }}>
                    <Check size={16} /> Lưu danh mục
                  </button>
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

export default CategoriesPage;
