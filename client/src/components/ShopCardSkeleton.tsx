import React from 'react';

export const ShopCardSkeleton: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
        border: '1px solid #f1f5f9',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Image Skeleton */}
      <div
        className="skeleton-shimmer"
        style={{
          width: '100%',
          height: '170px',
        }}
      />

      {/* Body Skeleton */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div
            className="skeleton-shimmer"
            style={{ width: '60%', height: '22px', borderRadius: '6px' }}
          />
          <div
            className="skeleton-shimmer"
            style={{ width: '45px', height: '22px', borderRadius: '6px' }}
          />
        </div>

        <div
          className="skeleton-shimmer"
          style={{ width: '40%', height: '14px', borderRadius: '4px', marginBottom: '12px' }}
        />

        <div
          className="skeleton-shimmer"
          style={{ width: '100%', height: '12px', borderRadius: '4px', marginBottom: '6px' }}
        />
        <div
          className="skeleton-shimmer"
          style={{ width: '80%', height: '12px', borderRadius: '4px', marginBottom: '16px' }}
        />

        <div
          className="skeleton-shimmer"
          style={{ width: '65%', height: '12px', borderRadius: '4px', marginBottom: '16px', marginTop: 'auto' }}
        />

        <div
          className="skeleton-shimmer"
          style={{ width: '100%', height: '40px', borderRadius: '10px' }}
        />
      </div>
    </div>
  );
};
