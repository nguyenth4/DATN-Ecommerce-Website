import React from 'react';
import { Skeleton } from './ui/Skeleton';

export const ProductDetailSkeleton = () => {
  return (
    <div className="container" style={{ paddingTop: 'var(--s5)' }}>
      {/* Breadcrumb skeleton */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem' }}>
        <Skeleton width="60px" height="20px" />
        <Skeleton width="10px" height="20px" />
        <Skeleton width="80px" height="20px" />
        <Skeleton width="10px" height="20px" />
        <Skeleton width="150px" height="20px" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', marginBottom: '3rem' }}>
        {/* Left Column (Images) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Skeleton width="100%" height="450px" borderRadius="16px" />
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} width="80px" height="80px" borderRadius="12px" />
            ))}
          </div>
        </div>

        {/* Right Column (Info) */}
        <div>
          <Skeleton width="100px" height="24px" style={{ marginBottom: '1rem' }} />
          <Skeleton width="90%" height="40px" style={{ marginBottom: '1.5rem' }} />
          <Skeleton width="60%" height="32px" style={{ marginBottom: '2rem' }} />
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <Skeleton width="100px" height="40px" borderRadius="50px" />
            <Skeleton width="100px" height="40px" borderRadius="50px" />
            <Skeleton width="100px" height="40px" borderRadius="50px" />
          </div>

          <Skeleton width="100%" height="80px" borderRadius="12px" style={{ marginBottom: '1.5rem' }} />
          <Skeleton width="100%" height="60px" borderRadius="12px" />
        </div>
      </div>
      
      {/* Description & Specs skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '3.5rem', marginTop: '3rem', borderTop: '1px solid var(--border)', paddingTop: '3rem' }}>
         <div>
            <Skeleton width="200px" height="32px" style={{ marginBottom: '1.5rem' }} />
            <Skeleton width="100%" height="20px" style={{ marginBottom: '0.5rem' }} />
            <Skeleton width="90%" height="20px" style={{ marginBottom: '0.5rem' }} />
            <Skeleton width="95%" height="20px" style={{ marginBottom: '0.5rem' }} />
         </div>
         <div>
            <Skeleton width="200px" height="32px" style={{ marginBottom: '1.5rem' }} />
            <Skeleton width="100%" height="40px" style={{ marginBottom: '0.5rem' }} />
            <Skeleton width="100%" height="40px" style={{ marginBottom: '0.5rem' }} />
            <Skeleton width="100%" height="40px" style={{ marginBottom: '0.5rem' }} />
         </div>
      </div>
    </div>
  );
};
