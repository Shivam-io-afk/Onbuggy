import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Home, MessageSquare } from 'lucide-react';

export const SoonPage: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '560px',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '3rem 2rem',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid #e2e8f0',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#fef3c7',
            color: '#d97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
          }}
        >
          <Sparkles size={32} />
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--dark)', marginBottom: '0.75rem', fontFamily: 'var(--font-brand)' }}>
          Feature Coming Soon!
        </h1>

        <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          We are actively building and expanding this section to deliver an even better experience. Thank you for your patience!
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link
            to="/"
            style={{
              backgroundColor: 'var(--primary)',
              color: '#064e3b',
              fontWeight: 700,
              padding: '11px 22px',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Home size={16} /> Return to Storefront
          </Link>
          <Link
            to="/contact-us"
            style={{
              backgroundColor: '#f1f5f9',
              color: '#334155',
              fontWeight: 600,
              padding: '11px 20px',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <MessageSquare size={16} /> Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

