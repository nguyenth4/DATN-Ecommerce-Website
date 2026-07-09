import { Skeleton } from './ui/Skeleton';

export const ProductCardSkeleton = () => {
  return (
    <article className="product-card" style={{ boxShadow: 'none', border: '1px solid var(--border)' }}>
      <div className="img-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Skeleton width="100%" height="200px" borderRadius="12px" />
      </div>
      
      <Skeleton width="120px" height="16px" style={{ marginTop: '16px', marginBottom: '8px' }} />
      <Skeleton width="90%" height="24px" style={{ marginBottom: '8px' }} />
      <Skeleton width="60%" height="24px" style={{ marginBottom: '16px' }} />
      
      <div className="stars" style={{ marginBottom: '16px' }}>
        <Skeleton width="100px" height="16px" />
      </div>

      <div style={{
          marginTop: 'auto',
          paddingTop: '0.65rem',
          borderTop: '1px dashed var(--rule, #eaeaea)',
          display: 'flex',
          alignItems: 'center',
      }}>
         <Skeleton width="80px" height="20px" />
      </div>
      
      <Skeleton width="100%" height="40px" borderRadius="50px" style={{ marginTop: '0.65rem' }} />
    </article>
  );
};
