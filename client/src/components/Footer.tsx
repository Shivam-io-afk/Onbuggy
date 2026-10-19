import React from 'react';
import { Link } from 'react-router-dom';
import { siteConfig } from '../config/site';

export const Footer: React.FC = () => {
  return (
    <footer style={{ backgroundColor: 'var(--dark)', color: '#ffffff', paddingTop: '4rem', paddingBottom: '2.5rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
        {/* Brand & 4 Columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Col 1: Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem' }}>
              <img src="/resorces/other/logo2.svg" alt="Onbuggy" style={{ height: '36px', width: '36px' }} />
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-brand)' }}>
                On<span style={{ color: 'var(--primary)' }}>buggy</span>
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Fastest hyperlocal essentials delivery in {siteConfig.serviceableCity}. Fresh groceries, farm vegetables, and certified medicines at your doorstep in {siteConfig.avgDeliveryMins} minutes.
            </p>
            {/* Social media icons with accessible labels */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow Onbuggy on Facebook"
                style={{ color: '#94a3b8', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}
              >
                <i className="fa-brands fa-facebook-f" style={{ fontSize: '1.1rem' }} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow Onbuggy on Instagram"
                style={{ color: '#94a3b8', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}
              >
                <i className="fa-brands fa-instagram" style={{ fontSize: '1.1rem' }} />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow Onbuggy on X (formerly Twitter)"
                style={{ color: '#94a3b8', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}
              >
                <i className="fa-brands fa-x-twitter" style={{ fontSize: '1.1rem' }} />
              </a>
            </div>
          </div>

          {/* Col 2: About & Legal */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              About & Legal
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '0.9rem', color: '#cbd5e1' }}>
              <li><Link to="/about-us" style={{ color: '#cbd5e1', textDecoration: 'none' }}>About Onbuggy</Link></li>
              <li><Link to="/contact-us" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Contact & Support</Link></li>
              <li><Link to="/privacy-policy" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Privacy Policy (DPDP 2023)</Link></li>
              <li><Link to="/terms-and-conditions" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Terms & Conditions</Link></li>
              <li><Link to="/faq" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Frequently Asked Questions</Link></li>
            </ul>
          </div>

          {/* Col 3: Customer Services */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Quick Essentials
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '0.9rem', color: '#cbd5e1' }}>
              <li><Link to="/order-gothru?category=medicine" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Prescription Medicines</Link></li>
              <li><Link to="/order-gothru?category=grocery" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Daily Kirana & Groceries</Link></li>
              <li><Link to="/order-gothru?category=vegetable" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Fresh Fruits & Veggies</Link></li>
              <li><Link to="/my-orders" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Track Active Delivery</Link></li>
              <li><Link to="/contact-us" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Report an Issue</Link></li>
            </ul>
          </div>

          {/* Col 4: Partners & Coverage */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Merchant Partners
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '0.9rem', color: '#cbd5e1' }}>
              <li><a href="/#categories" style={{ color: '#cbd5e1', textDecoration: 'none' }}>12+ Verified Stores in Rewa</a></li>
              <li><Link to="/contact-us" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Register Local Shop</Link></li>
              <li><Link to="/soon" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Merchant Partner Portal</Link></li>
              <li><Link to="/soon" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Careers at Onbuggy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '8px',
            fontSize: '0.8rem',
            color: '#64748b',
          }}
        >
          <p>
            By continuing past this page, you agree to our Terms of Service, Privacy Policy, and Prescription Fulfillment Guidelines.
          </p>
          <p>
            © {new Date().getFullYear()} {siteConfig.legalEntity}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

