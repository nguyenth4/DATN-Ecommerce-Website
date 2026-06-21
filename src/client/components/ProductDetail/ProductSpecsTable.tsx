import React from 'react';

interface ProductSpecsTableProps {
  specifications: Record<string, string>;
}

const ProductSpecsTable: React.FC<ProductSpecsTableProps> = ({ specifications }) => {
  return (
    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)', alignSelf: 'start' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.2rem', borderBottom: '2px solid var(--dark)', paddingBottom: '0.5rem' }}>THÔNG SỐ KỸ THUẬT</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {Object.entries(specifications).map(([key, val], idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '0.8rem 0.5rem 0.8rem 0', fontSize: '0.85rem', color: '#666', width: '40%' }}>
                <strong>{key}</strong>
              </td>
              <td style={{ padding: '0.8rem 0', fontSize: '0.85rem', color: '#111' }}>
                {typeof val === 'object' ? JSON.stringify(val) : String(val)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductSpecsTable;
