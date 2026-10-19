import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { siteConfig } from '../config/site';
import {
  MapPin,
  Navigation,
  User as UserIcon,
  ShoppingBag,
  LogOut,
  LogIn,
  ChevronDown,
  Menu,
  X,
  Home,
  Layers,
  FileText,
  HelpCircle,
  Phone,
  Info,
  ShieldAlert,
  Bike,
  Store,
} from 'lucide-react';
import { LocationPickerModal } from './LocationPickerModal';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, userLocation, setUserLocation } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Close dropdown on outside click or Esc key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        setIsLocModalOpen(false);
        setMobileDrawerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  const isCurrent = (path: string) => location.pathname === path;

  const handleCategoryClick = (e: React.MouseEvent) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById('categories');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          height: '65px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1.5rem',
        }}
      >
        <div
          style={{
            maxWidth: '1350px',
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* Brand Logo with semantic span */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <img
              src="/resorces/other/logo2.svg"
              alt="Onbuggy"
              style={{ height: '40px', width: '40px', objectFit: 'contain' }}
            />
            <span
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                letterSpacing: '-0.5px',
                color: 'var(--dark)',
                fontFamily: 'var(--font-brand)',
              }}
            >
              On<span style={{ color: 'var(--primary)' }}>buggy</span>
            </span>
          </Link>

          {/* Location Bar */}
          <div
            onClick={() => setIsLocModalOpen(true)}
            role="button"
            tabIndex={0}
            aria-label={`Delivery location: ${userLocation}. Click to change.`}
            onKeyDown={(e) => e.key === 'Enter' && setIsLocModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#f1f5f9',
              padding: '6px 14px',
              borderRadius: '9999px',
              cursor: 'pointer',
              border: '1px solid #e2e8f0',
              maxWidth: '300px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: '0.86rem',
            }}
          >
            <MapPin size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span style={{ fontWeight: 500, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userLocation || `${siteConfig.serviceableCity}, Madhya Pradesh`}
            </span>
            <ChevronDown size={14} style={{ color: '#64748b', marginLeft: 'auto', flexShrink: 0 }} />
          </div>

          {/* Desktop Nav Links */}
          <nav
            style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}
            className="desktop-nav"
            aria-label="Main Navigation"
          >
            <Link
              to="/"
              style={{
                fontSize: '0.95rem',
                fontWeight: isCurrent('/') ? 700 : 500,
                color: isCurrent('/') ? 'var(--primary-hover)' : '#334155',
                borderBottom: isCurrent('/') ? '2px solid var(--primary)' : '2px solid transparent',
                paddingBottom: '4px',
                textDecoration: 'none',
              }}
            >
              Home
            </Link>
            <a
              href="/#categories"
              onClick={handleCategoryClick}
              style={{ fontSize: '0.95rem', fontWeight: 500, color: '#334155', textDecoration: 'none' }}
            >
              Categories
            </a>
            <Link
              to="/order-gothru"
              style={{
                fontSize: '0.95rem',
                fontWeight: isCurrent('/order-gothru') ? 700 : 500,
                color: isCurrent('/order-gothru') ? 'var(--primary-hover)' : '#334155',
                borderBottom: isCurrent('/order-gothru') ? '2px solid var(--primary)' : '2px solid transparent',
                paddingBottom: '4px',
                textDecoration: 'none',
              }}
            >
              Instant Order
            </Link>
            <Link
              to="/about-us"
              style={{
                fontSize: '0.95rem',
                fontWeight: isCurrent('/about-us') ? 700 : 500,
                color: isCurrent('/about-us') ? 'var(--primary-hover)' : '#334155',
                textDecoration: 'none',
              }}
            >
              About
            </Link>

            {/* User Dropdown */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: 'var(--dark)',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--dark)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                  }}
                >
                  {isAuthenticated && user?.name ? user.name[0].toUpperCase() : <UserIcon size={14} />}
                </div>
                <span>{isAuthenticated && user?.name ? `Hi, ${user.name.split(' ')[0]}` : 'Account'}</span>
                <ChevronDown size={14} style={{ color: '#64748b' }} />
              </button>

              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '220px',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                    border: '1px solid #e2e8f0',
                    padding: '8px',
                    zIndex: 200,
                  }}
                >
                  {isAuthenticated ? (
                    <>
                      <div style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--dark)' }}>{user?.name}</p>
                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{user?.email}</p>
                      </div>
                      <Link
                        to="/user-profile"
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          fontSize: '0.88rem',
                          color: '#334155',
                          borderRadius: '8px',
                          textDecoration: 'none',
                        }}
                      >
                        <UserIcon size={16} color="var(--primary-hover)" />
                        My Profile
                      </Link>
                      <Link
                        to="/my-orders"
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          fontSize: '0.88rem',
                          color: '#334155',
                          borderRadius: '8px',
                          textDecoration: 'none',
                        }}
                      >
                        <ShoppingBag size={16} color="var(--primary-hover)" />
                        My Orders & Tracking
                      </Link>

                      {(user?.role === 'admin' || import.meta.env.DEV) && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 12px',
                            fontSize: '0.88rem',
                            color: '#0f172a',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            backgroundColor: '#f8fafc',
                            fontWeight: 600,
                            margin: '2px 0',
                          }}
                        >
                          <ShieldAlert size={16} color="#ef4444" />
                          Admin Panel
                        </Link>
                      )}

                      {(user?.role === 'delivery' || user?.role === 'admin' || import.meta.env.DEV) && (
                        <Link
                          to="/delivery"
                          onClick={() => setDropdownOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 12px',
                            fontSize: '0.88rem',
                            color: '#0f172a',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            backgroundColor: '#f8fafc',
                            fontWeight: 600,
                            margin: '2px 0',
                          }}
                        >
                          <Bike size={16} color="#059669" />
                          Delivery Boy Panel
                        </Link>
                      )}

                      {(user?.role === 'shopkeeper' || user?.role === 'admin' || import.meta.env.DEV) && (
                        <Link
                          to="/merchant"
                          onClick={() => setDropdownOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 12px',
                            fontSize: '0.88rem',
                            color: '#0f172a',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            backgroundColor: '#f8fafc',
                            fontWeight: 600,
                            margin: '2px 0',
                          }}
                        >
                          <Store size={16} color="#2563eb" />
                          Merchant Store Panel
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setDropdownOpen(false);
                          navigate('/');
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          fontSize: '0.88rem',
                          color: '#ef4444',
                          borderRadius: '8px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/signin"
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          fontSize: '0.88rem',
                          color: '#334155',
                          borderRadius: '8px',
                          textDecoration: 'none',
                        }}
                      >
                        <LogIn size={16} color="var(--primary-hover)" />
                        Sign In
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          fontSize: '0.88rem',
                          color: '#334155',
                          borderRadius: '8px',
                          textDecoration: 'none',
                        }}
                      >
                        <UserIcon size={16} color="var(--primary-hover)" />
                        Register Account
                      </Link>

                      {import.meta.env.DEV && (
                        <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '6px', paddingTop: '6px' }}>
                          <Link
                            to="/admin"
                            onClick={() => setDropdownOpen(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 12px',
                              fontSize: '0.82rem',
                              color: '#334155',
                              textDecoration: 'none',
                            }}
                          >
                            <ShieldAlert size={14} color="#ef4444" />
                            Admin Panel
                          </Link>
                          <Link
                            to="/delivery"
                            onClick={() => setDropdownOpen(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 12px',
                              fontSize: '0.82rem',
                              color: '#334155',
                              textDecoration: 'none',
                            }}
                          >
                            <Bike size={14} color="#059669" />
                            Delivery Boy Panel
                          </Link>
                          <Link
                            to="/merchant"
                            onClick={() => setDropdownOpen(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 12px',
                              fontSize: '0.82rem',
                              color: '#334155',
                              textDecoration: 'none',
                            }}
                          >
                            <Store size={14} color="#2563eb" />
                            Merchant Panel
                          </Link>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            aria-label="Toggle navigation menu"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: 'var(--dark)',
              padding: '6px',
              cursor: 'pointer',
            }}
          >
            {mobileDrawerOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 150,
          }}
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '280px',
              height: '100%',
              backgroundColor: '#ffffff',
              padding: '2rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-brand)', color: 'var(--dark)' }}>
                On<span style={{ color: 'var(--primary)' }}>buggy</span>
              </span>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="Close menu"
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155', fontWeight: 600, textDecoration: 'none' }}>
              <Home size={18} color="var(--primary-hover)" /> Home
            </Link>
            <a href="/#categories" onClick={handleCategoryClick} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155', fontWeight: 600, textDecoration: 'none' }}>
              <Layers size={18} color="var(--primary-hover)" /> Categories
            </a>
            <Link to="/order-gothru" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155', fontWeight: 600, textDecoration: 'none' }}>
              <ShoppingBag size={18} color="var(--primary-hover)" /> Instant Order
            </Link>
            <Link to="/my-orders" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155', fontWeight: 600, textDecoration: 'none' }}>
              <Navigation size={18} color="var(--primary-hover)" /> My Orders & Tracking
            </Link>
            <Link to="/about-us" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155', fontWeight: 600, textDecoration: 'none' }}>
              <Info size={18} color="var(--primary-hover)" /> About Us
            </Link>
            <Link to="/contact-us" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155', fontWeight: 600, textDecoration: 'none' }}>
              <Phone size={18} color="var(--primary-hover)" /> Contact Support
            </Link>
            <Link to="/faq" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155', fontWeight: 600, textDecoration: 'none' }}>
              <HelpCircle size={18} color="var(--primary-hover)" /> FAQs
            </Link>

            {(user?.role === 'admin' || import.meta.env.DEV) && (
              <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#b91c1c', fontWeight: 700, textDecoration: 'none' }}>
                <ShieldAlert size={18} color="#ef4444" /> Admin Panel
              </Link>
            )}

            {(user?.role === 'delivery' || user?.role === 'admin' || import.meta.env.DEV) && (
              <Link to="/delivery" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#047857', fontWeight: 700, textDecoration: 'none' }}>
                <Bike size={18} color="#059669" /> Delivery Boy Panel
              </Link>
            )}

            {(user?.role === 'shopkeeper' || user?.role === 'admin' || import.meta.env.DEV) && (
              <Link to="/merchant" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1d4ed8', fontWeight: 700, textDecoration: 'none' }}>
                <Store size={18} color="#2563eb" /> Merchant Store Panel
              </Link>
            )}

            <div style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileDrawerOpen(false);
                    navigate('/');
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    backgroundColor: '#fee2e2',
                    color: '#b91c1c',
                    fontWeight: 700,
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Link
                    to="/signin"
                    style={{
                      textAlign: 'center',
                      padding: '10px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--primary)',
                      color: '#064e3b',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    style={{
                      textAlign: 'center',
                      padding: '10px',
                      borderRadius: '8px',
                      backgroundColor: '#f1f5f9',
                      color: '#334155',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Rewa Location Picker Modal with Autocomplete Recommendations */}
      <LocationPickerModal
        isOpen={isLocModalOpen}
        onClose={() => setIsLocModalOpen(false)}
        currentLocation={userLocation}
        onSelectLocation={(data) => {
          setUserLocation(data.address, {
            lat: data.lat,
            lng: data.lng,
            area: data.area,
          });
        }}
      />

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav
        className="mobile-bottom-bar"
        aria-label="Mobile Navigation"
        style={{
          display: 'none',
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60px',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          boxShadow: '0 -4px 15px rgba(0,0,0,0.06)',
          zIndex: 90,
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '0 8px',
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            color: isCurrent('/') ? 'var(--primary-hover)' : '#64748b',
            fontSize: '0.72rem',
            fontWeight: isCurrent('/') ? 700 : 500,
            textDecoration: 'none',
          }}
        >
          <Home size={18} />
          <span>Home</span>
        </Link>

        <a
          href="/#categories"
          onClick={handleCategoryClick}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            color: '#64748b',
            fontSize: '0.72rem',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          <Layers size={18} />
          <span>Categories</span>
        </a>

        <Link
          to="/order-gothru"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            color: isCurrent('/order-gothru') ? 'var(--primary-hover)' : '#64748b',
            fontSize: '0.72rem',
            fontWeight: isCurrent('/order-gothru') ? 700 : 500,
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--primary)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#064e3b',
              marginTop: '-12px',
              boxShadow: '0 4px 10px rgba(48,232,73,0.3)',
            }}
          >
            <ShoppingBag size={16} />
          </div>
          <span>Order</span>
        </Link>

        <Link
          to={isAuthenticated ? '/my-orders' : '/signin'}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            color: isCurrent('/my-orders') || isCurrent('/signin') ? 'var(--primary-hover)' : '#64748b',
            fontSize: '0.72rem',
            fontWeight: isCurrent('/my-orders') || isCurrent('/signin') ? 700 : 500,
            textDecoration: 'none',
          }}
        >
          <Navigation size={18} />
          <span>Orders</span>
        </Link>

        <Link
          to={isAuthenticated ? '/user-profile' : '/signin'}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            color: isCurrent('/user-profile') ? 'var(--primary-hover)' : '#64748b',
            fontSize: '0.72rem',
            fontWeight: isCurrent('/user-profile') ? 700 : 500,
            textDecoration: 'none',
          }}
        >
          <UserIcon size={18} />
          <span>{isAuthenticated ? 'Profile' : 'Sign In'}</span>
        </Link>
      </nav>
    </>
  );
};

