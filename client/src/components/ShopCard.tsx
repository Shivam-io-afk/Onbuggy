import React from 'react';
import { Link } from 'react-router-dom';
import { Shop } from '../types';
import { Star, Clock, MapPin, ArrowRight } from 'lucide-react';

interface ShopCardProps {
  shop: Shop;
}

export const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
  const isAvailable = shop.isOpen;

  // Category fallback images if shop uses generic image
  const getShopImage = (): string => {
    if (!shop.image || shop.image.includes('8626119.png')) {
      if (shop.category === 'grocery') {
        return '/resorces/category/1682360.png';
      }
      if (shop.category === 'vegetable') {
        return '/resorces/category/647237.png';
      }
      return '/resorces/category/1400260.png';
    }
    return shop.image.startsWith('/') ? shop.image : `/${shop.image}`;
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
        border: '1px solid #f1f5f9',
        transition: 'all 0.25s ease',
        filter: isAvailable ? 'none' : 'grayscale(100%)',
        opacity: isAvailable ? 1 : 0.75,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (isAvailable) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (isAvailable) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,0,0,0.06)';
        }
      }}
    >
      {/* Whole card clickable link when available */}
      {isAvailable && (
        <Link
          to={`/order-gothru?shopId=${shop._id}`}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            textIndent: '-9999px',
            overflow: 'hidden',
          }}
          aria-label={`Order from ${shop.name}`}
        >
          Order from {shop.name}
        </Link>
      )}

      {/* Image Banner */}
      <div style={{ position: 'relative', height: '170px', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
        <img
          src={getShopImage()}
          alt={shop.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2 }}>
          <span className={isAvailable ? 'badge-status-open' : 'badge-status-closed'}>
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: isAvailable ? '#22c55e' : '#ef4444',
              }}
            />
            {isAvailable ? 'Shop Open' : 'Closed • Opens 6:00 PM'}
          </span>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            backgroundColor: 'rgba(18, 19, 49, 0.85)',
            backdropFilter: 'blur(4px)',
            color: '#ffffff',
            padding: '4px 10px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            zIndex: 2,
          }}
        >
          <Clock size={13} style={{ color: 'var(--primary)' }} />
          {shop.deliveryTimeMin} mins
        </div>
      </div>

      {/* Details Body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--dark)' }}>
              {shop.name}
            </h3>
            {!isAvailable && (
              <span
                style={{
                  display: 'inline-block',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  marginTop: '2px',
                }}
              >
                Opens 6:00 PM
              </span>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#fef08a',
              color: '#854d0e',
              fontWeight: 700,
              fontSize: '0.82rem',
              padding: '3px 8px',
              borderRadius: '6px',
            }}
          >
            <Star size={13} fill="#854d0e" />
            {shop.rating.toFixed(1)}
          </div>
        </div>

        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--primary-hover)',
            fontWeight: 600,
            marginBottom: '6px',
          }}
        >
          {shop.categoryLabel}
        </p>

        <p
          style={{
            fontSize: '0.85rem',
            color: '#64748b',
            lineHeight: 1.45,
            marginBottom: '1rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flexGrow: 1,
          }}
        >
          {shop.description}
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            color: '#94a3b8',
            borderTop: '1px solid #f1f5f9',
            paddingTop: '10px',
            marginBottom: '1rem',
          }}
        >
          <MapPin size={14} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {shop.address} ({shop.distanceKm} km away)
          </span>
        </div>

        {isAvailable ? (
          <div
            style={{
              backgroundColor: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #a7f3d0',
              padding: '10px 16px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              position: 'relative',
              zIndex: 2,
              pointerEvents: 'none',
            }}
          >
            Order from Shop <ArrowRight size={16} />
          </div>
        ) : (
          <button
            disabled
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: '10px',
              backgroundColor: '#f1f5f9',
              color: '#94a3b8',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'not-allowed',
              border: 'none',
            }}
          >
            Currently Unavailable (Opens 6:00 PM)
          </button>
        )}
      </div>
    </div>
  );
};

