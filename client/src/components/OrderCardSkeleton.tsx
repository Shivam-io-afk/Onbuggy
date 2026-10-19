import React from 'react';

export const OrderCardSkeleton: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '1.25rem',
        border: '1px solid #f1f5f9',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        marginBottom: '1rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div className="skeleton-shimmer" style={{ width: '120px', height: '18px', borderRadius: '4px' }} />
        <div className="skeleton-shimmer" style={{ width: '80px', height: '22px', borderRadius: '9999px' }} />
      </div>

      <div className="skeleton-shimmer" style={{ width: '180px', height: '16px', borderRadius: '4px', marginBottom: '10px' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
        <div className="skeleton-shimmer" style={{ width: '90px', height: '14px', borderRadius: '4px' }} />
        <div className="skeleton-shimmer" style={{ width: '70px', height: '18px', borderRadius: '4px' }} />
      </div>
    </div>
  );
};

