import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ShoppingBag, ArrowLeft, Search } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const NotFoundPage: React.FC = () => {
  useDocumentTitle('404 Page Not Found', 'The requested page could not be found on Onbuggy.');

  return (
    <div
      style={{
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '540px',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '3.5rem 2rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
          border: '1px solid #e2e8f0',
        }}
      >
        <div
          style={{
            fontSize: '5rem',
            fontWeight: 900,
            color: 'var(--primary-hover)',
            fontFamily: 'var(--font-brand)',
            lineHeight: 1,
            marginBottom: '1rem',
          }}
        >
          404
        </div>

        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '0.75rem' }}>
          Page Not Found
        </h1>

        <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          The page or shop link you are looking for doesn't exist, has been moved, or is temporarily unavailable.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/"
            style={{
              backgroundColor: 'var(--primary)',
              color: '#064e3b',
              fontWeight: 700,
              padding: '12px 24px',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Home size={18} /> Return to Storefront
          </Link>
          <Link
            to="/my-orders"
            style={{
              backgroundColor: '#f1f5f9',
              color: '#334155',
              fontWeight: 600,
              padding: '12px 20px',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <ShoppingBag size={18} /> Track Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

