import React from 'react';

interface ProductSpecsTableProps {
  specifications: Record<string, string>;
  weight?: number | string;
  height?: number | string;
  width?: number | string;
  length?: number | string;
}

const ProductSpecsTable: React.FC<ProductSpecsTableProps> = ({
  specifications = {},
  weight,
  height,
  width,
  length,
}) => {
  // Combine native attributes with specifications metadata
  const mergedSpecs: Record<string, string> = { ...specifications };

  if (weight && !mergedSpecs['Trọng lượng']) {
    mergedSpecs['Trọng lượng'] = `${weight} g`;
  }

  if ((height || width || length) && !mergedSpecs['Kích thước']) {
    const dims = [length ? `${length}cm` : null, width ? `${width}cm` : null, height ? `${height}cm` : null]
      .filter(Boolean)
      .join(' x ');
    if (dims) {
      mergedSpecs['Kích thước'] = dims;
    }
  }

  const entries = Object.entries(mergedSpecs);

  return (
    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', alignSelf: 'start', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.2rem', borderBottom: '2px solid var(--dark)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>📋</span> THÔNG SỐ KỸ THUẬT
      </h3>
      
      {entries.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {entries.map(([key, val], idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#f8fafc' : '#ffffff' }}>
                <td style={{ padding: '0.75rem 0.75rem', fontSize: '0.85rem', color: '#475569', width: '40%' }}>
                  <strong>{key}</strong>
                </td>
                <td style={{ padding: '0.75rem 0.75rem', fontSize: '0.85rem', color: '#0f172a', fontWeight: 500 }}>
                  {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
          Đang cập nhật thông số kỹ thuật...
        </p>
      )}
    </div>
  );
};

export default ProductSpecsTable;
