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
  Power,
  Package,
  BarChart3,
  ArrowRight,
  Users,
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

  // Route & Portal Context Detection
  const isDeliveryRoute = location.pathname.startsWith('/delivery');
  const isMerchantRoute = location.pathname.startsWith('/merchant') || location.pathname.startsWith('/vendor');
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isPortalRoute = isDeliveryRoute || isMerchantRoute || isAdminRoute;

  // URL search query tab (?tab=...)
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab');

  // Rider Duty State (synced with localStorage & custom window event)
  const [isRiderOnline, setIsRiderOnline] = useState<boolean>(() => {
    return localStorage.getItem('onbuggy_rider_online') !== 'false';
  });

  useEffect(() => {
    const syncDuty = () => {
      setIsRiderOnline(localStorage.getItem('onbuggy_rider_online') !== 'false');
    };
    window.addEventListener('onbuggy_duty_changed', syncDuty);
    window.addEventListener('storage', syncDuty);
    return () => {
      window.removeEventListener('onbuggy_duty_changed', syncDuty);
      window.removeEventListener('storage', syncDuty);
    };
  }, []);

  const handleToggleRiderDuty = () => {
    const next = !isRiderOnline;
    setIsRiderOnline(next);
    localStorage.setItem('onbuggy_rider_online', String(next));
    window.dispatchEvent(new Event('onbuggy_duty_changed'));
  };

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
  }, [location.pathname, location.search]);

  const isCurrent = (path: string) => location.pathname === path && !currentTab;

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
          {/* Brand Logo with Portal Role Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link
              to={isDeliveryRoute ? '/delivery' : isMerchantRoute ? '/merchant' : isAdminRoute ? '/admin' : '/'}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
            >
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

            {/* Portal Badge */}
            {isDeliveryRoute && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#ecfdf5',
                  color: '#047857',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: '1px solid #a7f3d0',
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase',
                }}
              >
                <Bike size={12} />
                Rider Fleet
              </span>
            )}

            {isMerchantRoute && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#eff6ff',
                  color: '#1d4ed8',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: '1px solid #bfdbfe',
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase',
                }}
              >
                <Store size={12} />
                Merchant Hub
              </span>
            )}

            {isAdminRoute && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#fef2f2',
                  color: '#b91c1c',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: '1px solid #fecaca',
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase',
                }}
              >
                <ShieldAlert size={12} />
                Admin Command
              </span>
            )}
          </div>

          {/* Center Context Bar: Location Picker for Storefront OR Live Portal Status for Panels */}
          {!isPortalRoute ? (
            /* Customer Location Bar */
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
          ) : isDeliveryRoute ? (
            /* Delivery Portal: Duty Switcher & Hub Indicator */
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: '#f8fafc',
                padding: '4px 12px',
                borderRadius: '9999px',
                border: '1px solid #e2e8f0',
              }}
            >
              <button
                type="button"
                onClick={handleToggleRiderDuty}
                title="Toggle Online/Offline Duty"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  backgroundColor: isRiderOnline ? '#dcfce7' : '#fee2e2',
                  color: isRiderOnline ? '#15803d' : '#b91c1c',
                  border: isRiderOnline ? '1px solid #86efac' : '1px solid #fca5a5',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: isRiderOnline ? '#16a34a' : '#dc2626',
                    boxShadow: isRiderOnline ? '0 0 6px #16a34a' : 'none',
                  }}
                />
                {isRiderOnline ? 'ON DUTY' : 'OFF DUTY'}
              </button>
              <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                Rewa Fleet Hub
              </span>
            </div>
          ) : isMerchantRoute ? (
            /* Merchant Portal: Store Console Indicator */
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#f0fdf4',
                padding: '5px 14px',
                borderRadius: '9999px',
                border: '1px solid #bbf7d0',
                fontSize: '0.82rem',
                color: '#166534',
                fontWeight: 700,
              }}
            >
              <Store size={15} style={{ color: '#15803d' }} />
              <span>Store Partner Console • Rewa Central</span>
            </div>
          ) : (
            /* Admin Portal: Command Center Indicator */
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#fef2f2',
                padding: '5px 14px',
                borderRadius: '9999px',
                border: '1px solid #fecaca',
                fontSize: '0.82rem',
                color: '#991b1b',
                fontWeight: 700,
              }}
            >
              <ShieldAlert size={15} style={{ color: '#ef4444' }} />
              <span>Central Command & Dispatch • Rewa System</span>
            </div>
          )}

          {/* Desktop Nav Links */}
          <nav
            style={{ display: 'flex', alignItems: 'center', gap: '1.4rem' }}
            className="desktop-nav"
            aria-label="Main Navigation"
          >
            {/* 1. CUSTOMER STOREFRONT LINKS */}
            {!isPortalRoute && (
              <>
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
              </>
            )}

            {/* 2. DELIVERY RIDER PORTAL LINKS */}
            {isDeliveryRoute && (
              <>
                <Link
                  to="/delivery?tab=active"
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: !currentTab || currentTab === 'active' ? 700 : 500,
                    color: !currentTab || currentTab === 'active' ? '#047857' : '#334155',
                    borderBottom: !currentTab || currentTab === 'active' ? '2px solid #059669' : '2px solid transparent',
                    paddingBottom: '4px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Bike size={15} />
                  Active Dispatches
                </Link>
                <Link
                  to="/delivery?tab=history"
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: currentTab === 'history' ? 700 : 500,
                    color: currentTab === 'history' ? '#047857' : '#334155',
                    borderBottom: currentTab === 'history' ? '2px solid #059669' : '2px solid transparent',
                    paddingBottom: '4px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <FileText size={15} />
                  Trip History
                </Link>
                <Link
                  to="/delivery?tab=profile"
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: currentTab === 'profile' ? 700 : 500,
                    color: currentTab === 'profile' ? '#047857' : '#334155',
                    borderBottom: currentTab === 'profile' ? '2px solid #059669' : '2px solid transparent',
                    paddingBottom: '4px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <UserIcon size={15} />
                  Duty & Profile
                </Link>
                <Link
                  to="/"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#334155',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  title="Switch to Customer Shopping Storefront"
                >
                  <ShoppingBag size={14} color="var(--primary-hover)" />
                  <span>Customer Store</span>
                </Link>
              </>
            )}

            {/* 3. MERCHANT PARTNER PORTAL LINKS */}
            {isMerchantRoute && (
              <>
                <Link
                  to="/merchant?tab=orders"
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: !currentTab || currentTab === 'orders' ? 700 : 500,
                    color: !currentTab || currentTab === 'orders' ? '#1d4ed8' : '#334155',
                    borderBottom: !currentTab || currentTab === 'orders' ? '2px solid #2563eb' : '2px solid transparent',
                    paddingBottom: '4px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Store size={15} />
                  Live Orders
                </Link>
                <Link
                  to="/merchant?tab=inventory"
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: currentTab === 'inventory' ? 700 : 500,
                    color: currentTab === 'inventory' ? '#1d4ed8' : '#334155',
                    borderBottom: currentTab === 'inventory' ? '2px solid #2563eb' : '2px solid transparent',
                    paddingBottom: '4px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Package size={15} />
                  Stock Catalog
                </Link>
                <Link
                  to="/merchant?tab=store"
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: currentTab === 'store' ? 700 : 500,
                    color: currentTab === 'store' ? '#1d4ed8' : '#334155',
                    borderBottom: currentTab === 'store' ? '2px solid #2563eb' : '2px solid transparent',
                    paddingBottom: '4px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Info size={15} />
                  Store Profile
                </Link>
                <Link
                  to="/"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#334155',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  title="Switch to Customer Shopping Storefront"
                >
                  <ShoppingBag size={14} color="var(--primary-hover)" />
                  <span>Customer Store</span>
                </Link>
              </>
            )}

            {/* 4. ADMIN COMMAND CENTER LINKS */}
            {isAdminRoute && (
              <>
                <Link
                  to="/admin?tab=orders"
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: !currentTab || currentTab === 'orders' ? 700 : 500,
                    color: !currentTab || currentTab === 'orders' ? '#b91c1c' : '#334155',
                    borderBottom: !currentTab || currentTab === 'orders' ? '2px solid #ef4444' : '2px solid transparent',
                    paddingBottom: '4px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <ShoppingBag size={15} />
                  Orders Dispatch
                </Link>
                <Link
                  to="/admin?tab=fleet"
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: currentTab === 'fleet' ? 700 : 500,
                    color: currentTab === 'fleet' ? '#b91c1c' : '#334155',
                    borderBottom: currentTab === 'fleet' ? '2px solid #ef4444' : '2px solid transparent',
                    paddingBottom: '4px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Bike size={15} />
                  Fleet & Stores
                </Link>
                <Link
                  to="/admin?tab=analytics"
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: currentTab === 'analytics' ? 700 : 500,
                    color: currentTab === 'analytics' ? '#b91c1c' : '#334155',
                    borderBottom: currentTab === 'analytics' ? '2px solid #ef4444' : '2px solid transparent',
                    paddingBottom: '4px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <BarChart3 size={15} />
                  Platform Analytics
                </Link>
                <Link
                  to="/"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#334155',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  title="Switch to Customer Shopping Storefront"
                >
                  <ShoppingBag size={14} color="var(--primary-hover)" />
                  <span>Customer Store</span>
                </Link>
              </>
            )}

            {/* Universal User Dropdown */}
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
                    backgroundColor: isDeliveryRoute
                      ? '#059669'
                      : isMerchantRoute
                      ? '#2563eb'
                      : isAdminRoute
                      ? '#b91c1c'
                      : 'var(--dark)',
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
                    width: '240px',
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
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--dark)', margin: 0 }}>
                            {user?.name}
                          </p>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor:
                                user?.role === 'admin'
                                  ? '#fee2e2'
                                  : user?.role === 'delivery'
                                  ? '#dcfce7'
                                  : user?.role === 'shopkeeper'
                                  ? '#eff6ff'
                                  : '#f1f5f9',
                              color:
                                user?.role === 'admin'
                                  ? '#b91c1c'
                                  : user?.role === 'delivery'
                                  ? '#047857'
                                  : user?.role === 'shopkeeper'
                                  ? '#1d4ed8'
                                  : '#475569',
                            }}
                          >
                            {user?.role || 'customer'}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '4px 0 0' }}>{user?.email}</p>
                      </div>

                      {/* Always show Customer Storefront link if inside a portal */}
                      {isPortalRoute && (
                        <Link
                          to="/"
                          onClick={() => setDropdownOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 12px',
                            fontSize: '0.86rem',
                            color: '#0f172a',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            backgroundColor: '#f8fafc',
                            fontWeight: 600,
                            margin: '4px 0',
                          }}
                        >
                          <ShoppingBag size={16} color="var(--primary-hover)" />
                          Customer Storefront
                        </Link>
                      )}

                      <Link
                        to="/user-profile"
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
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
                          padding: '8px 12px',
                          fontSize: '0.88rem',
                          color: '#334155',
                          borderRadius: '8px',
                          textDecoration: 'none',
                        }}
                      >
                        <Navigation size={16} color="var(--primary-hover)" />
                        My Orders & Tracking
                      </Link>

                      {/* Portal links based on user role or dev mode */}
                      {(user?.role === 'admin' || import.meta.env.DEV) && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 12px',
                            fontSize: '0.86rem',
                            color: '#b91c1c',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            backgroundColor: isAdminRoute ? '#fef2f2' : 'transparent',
                            fontWeight: 600,
                          }}
                        >
                          <ShieldAlert size={16} color="#ef4444" />
                          Admin Command
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
                            padding: '8px 12px',
                            fontSize: '0.86rem',
                            color: '#047857',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            backgroundColor: isDeliveryRoute ? '#ecfdf5' : 'transparent',
                            fontWeight: 600,
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
                            padding: '8px 12px',
                            fontSize: '0.86rem',
                            color: '#1d4ed8',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            backgroundColor: isMerchantRoute ? '#eff6ff' : 'transparent',
                            fontWeight: 600,
                          }}
                        >
                          <Store size={16} color="#2563eb" />
                          Merchant Store Panel
                        </Link>
                      )}

                      <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '6px', paddingTop: '6px' }}>
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
                            padding: '8px 12px',
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
                      </div>
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
                          <p style={{ fontSize: '0.72rem', color: '#94a3b8', padding: '2px 12px', textTransform: 'uppercase', fontWeight: 700 }}>
                            Dev Portals
                          </p>
                          <Link
                            to="/admin"
                            onClick={() => setDropdownOpen(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '6px 12px',
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
                              padding: '6px 12px',
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
                              padding: '6px 12px',
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

          {/* Mobile Hamburger Button */}
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

      {/* Mobile Drawer (Role & Portal Adapted) */}
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
              width: '290px',
              height: '100%',
              backgroundColor: '#ffffff',
              padding: '1.75rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-brand)', color: 'var(--dark)' }}>
                  On<span style={{ color: 'var(--primary)' }}>buggy</span>
                </span>
                {isDeliveryRoute ? (
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#047857', backgroundColor: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>
                    Rider
                  </span>
                ) : isMerchantRoute ? (
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1d4ed8', backgroundColor: '#eff6ff', padding: '2px 6px', borderRadius: '4px' }}>
                    Merchant
                  </span>
                ) : isAdminRoute ? (
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#b91c1c', backgroundColor: '#fee2e2', padding: '2px 6px', borderRadius: '4px' }}>
                    Admin
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="Close menu"
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* 1. DELIVERY RIDER DRAWER */}
            {isDeliveryRoute ? (
              <>
                {/* Rider Duty Button in Drawer */}
                <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Rider Duty Status:</span>
                    <button
                      type="button"
                      onClick={handleToggleRiderDuty}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        backgroundColor: isRiderOnline ? '#dcfce7' : '#fee2e2',
                        color: isRiderOnline ? '#15803d' : '#b91c1c',
                        border: isRiderOnline ? '1px solid #86efac' : '1px solid #fca5a5',
                      }}
                    >
                      {isRiderOnline ? '🟢 ON DUTY' : '🔴 OFF DUTY'}
                    </button>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8' }}>
                    {isRiderOnline ? 'Receiving real-time dispatch orders in Rewa' : 'Duty paused • Not receiving dispatches'}
                  </p>
                </div>

                <Link to="/delivery?tab=active" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#047857', fontWeight: 700, textDecoration: 'none' }}>
                  <Bike size={18} color="#059669" /> Active Dispatches & Radar
                </Link>
                <Link to="/delivery?tab=history" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155', fontWeight: 600, textDecoration: 'none' }}>
                  <FileText size={18} color="#059669" /> Trip History & Cash Remittance
                </Link>
                <Link to="/delivery?tab=profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155', fontWeight: 600, textDecoration: 'none' }}>
                  <UserIcon size={18} color="#059669" /> Rider Profile & Performance
                </Link>

                <div style={{ borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />

                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a', fontWeight: 700, textDecoration: 'none' }}>
                  <ShoppingBag size={18} color="var(--primary-hover)" /> Switch to Customer Store
                </Link>
              </>
            ) : isMerchantRoute ? (
              /* 2. MERCHANT DRAWER */
              <>
                <Link to="/merchant?tab=orders" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1d4ed8', fontWeight: 700, textDecoration: 'none' }}>
                  <Store size={18} color="#2563eb" /> Live Incoming Orders & Dispatch
                </Link>
                <Link to="/merchant?tab=inventory" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155', fontWeight: 600, textDecoration: 'none' }}>
                  <Package size={18} color="#2563eb" /> Catalog Products & In-Stock
                </Link>
                <Link to="/merchant?tab=store" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155', fontWeight: 600, textDecoration: 'none' }}>
                  <Info size={18} color="#2563eb" /> Store Details & Opening Hours
                </Link>

                <div style={{ borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />

                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a', fontWeight: 700, textDecoration: 'none' }}>
                  <ShoppingBag size={18} color="var(--primary-hover)" /> Switch to Customer Store
                </Link>
              </>
            ) : isAdminRoute ? (
              /* 3. ADMIN DRAWER */
              <>
                <Link to="/admin?tab=orders" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#b91c1c', fontWeight: 700, textDecoration: 'none' }}>
                  <ShoppingBag size={18} color="#ef4444" /> Live Orders & Dispatch
                </Link>
                <Link to="/admin?tab=fleet" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155', fontWeight: 600, textDecoration: 'none' }}>
                  <Bike size={18} color="#ef4444" /> Delivery Fleet Radar
                </Link>
                <Link to="/admin?tab=shops" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155', fontWeight: 600, textDecoration: 'none' }}>
                  <Store size={18} color="#ef4444" /> Merchant Partner Shops
                </Link>
                <Link to="/admin?tab=users" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155', fontWeight: 600, textDecoration: 'none' }}>
                  <Users size={18} color="#ef4444" /> Users & Permissions
                </Link>
                <Link to="/admin?tab=analytics" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155', fontWeight: 600, textDecoration: 'none' }}>
                  <BarChart3 size={18} color="#ef4444" /> Platform Analytics & Revenue
                </Link>

                <div style={{ borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />

                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a', fontWeight: 700, textDecoration: 'none' }}>
                  <ShoppingBag size={18} color="var(--primary-hover)" /> Switch to Customer Store
                </Link>
              </>
            ) : (
              /* 4. CUSTOMER STOREFRONT DRAWER */
              <>
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
              </>
            )}

            {/* Bottom Auth button */}
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

      {/* Mobile Fixed Bottom Navigation Bar (Context & Role Aware) */}
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
        {isDeliveryRoute ? (
          /* Rider Mobile Bottom Tabs */
          <>
            <Link
              to="/delivery?tab=active"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                color: !currentTab || currentTab === 'active' ? '#047857' : '#64748b',
                fontSize: '0.72rem',
                fontWeight: !currentTab || currentTab === 'active' ? 700 : 500,
                textDecoration: 'none',
              }}
            >
              <Bike size={18} />
              <span>Dispatches</span>
            </Link>

            <Link
              to="/delivery?tab=history"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                color: currentTab === 'history' ? '#047857' : '#64748b',
                fontSize: '0.72rem',
                fontWeight: currentTab === 'history' ? 700 : 500,
                textDecoration: 'none',
              }}
            >
              <FileText size={18} />
              <span>History</span>
            </Link>

            <button
              type="button"
              onClick={handleToggleRiderDuty}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isRiderOnline ? '#16a34a' : '#dc2626',
                fontSize: '0.72rem',
                fontWeight: 700,
              }}
            >
              <Power size={18} />
              <span>{isRiderOnline ? 'Duty ON' : 'Duty OFF'}</span>
            </button>

            <Link
              to="/"
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
              <ShoppingBag size={18} />
              <span>Store</span>
            </Link>
          </>
        ) : isMerchantRoute ? (
          /* Merchant Mobile Bottom Tabs */
          <>
            <Link
              to="/merchant?tab=orders"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                color: !currentTab || currentTab === 'orders' ? '#1d4ed8' : '#64748b',
                fontSize: '0.72rem',
                fontWeight: !currentTab || currentTab === 'orders' ? 700 : 500,
                textDecoration: 'none',
              }}
            >
              <Store size={18} />
              <span>Orders</span>
            </Link>

            <Link
              to="/merchant?tab=inventory"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                color: currentTab === 'inventory' ? '#1d4ed8' : '#64748b',
                fontSize: '0.72rem',
                fontWeight: currentTab === 'inventory' ? 700 : 500,
                textDecoration: 'none',
              }}
            >
              <Package size={18} />
              <span>Catalog</span>
            </Link>

            <Link
              to="/merchant?tab=store"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                color: currentTab === 'store' ? '#1d4ed8' : '#64748b',
                fontSize: '0.72rem',
                fontWeight: currentTab === 'store' ? 700 : 500,
                textDecoration: 'none',
              }}
            >
              <Info size={18} />
              <span>Store Info</span>
            </Link>

            <Link
              to="/"
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
              <ShoppingBag size={18} />
              <span>Store</span>
            </Link>
          </>
        ) : isAdminRoute ? (
          /* Admin Mobile Bottom Tabs */
          <>
            <Link
              to="/admin?tab=orders"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                color: !currentTab || currentTab === 'orders' ? '#b91c1c' : '#64748b',
                fontSize: '0.72rem',
                fontWeight: !currentTab || currentTab === 'orders' ? 700 : 500,
                textDecoration: 'none',
              }}
            >
              <ShoppingBag size={18} />
              <span>Orders</span>
            </Link>

            <Link
              to="/admin?tab=fleet"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                color: currentTab === 'fleet' ? '#b91c1c' : '#64748b',
                fontSize: '0.72rem',
                fontWeight: currentTab === 'fleet' ? 700 : 500,
                textDecoration: 'none',
              }}
            >
              <Bike size={18} />
              <span>Fleet</span>
            </Link>

            <Link
              to="/admin?tab=shops"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                color: currentTab === 'shops' ? '#b91c1c' : '#64748b',
                fontSize: '0.72rem',
                fontWeight: currentTab === 'shops' ? 700 : 500,
                textDecoration: 'none',
              }}
            >
              <Store size={18} />
              <span>Shops</span>
            </Link>

            <Link
              to="/"
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
              <Home size={18} />
              <span>Store</span>
            </Link>
          </>
        ) : (
          /* Standard Customer Mobile Bottom Tabs */
          <>
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
          </>
        )}
      </nav>
    </>
  );
};
