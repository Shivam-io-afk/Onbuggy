import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import {
  ShoppingBag,
  Store,
  Bike,
  ShieldAlert,
  Radio,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Zap,
  X,
} from 'lucide-react';

export const PortalSwitcherBar: React.FC = () => {
  const { user, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [connected, setConnected] = useState(false);
  const [minimized, setMinimized] = useState<boolean>(() => {
    const saved = localStorage.getItem('portalBarMinimized');
    return saved !== null ? saved === 'true' : true; // Default: HIDE
  });
  const [dismissed, setDismissed] = useState<boolean>(() => {
    return localStorage.getItem('portalBarDismissed') === 'true';
  });

  useEffect(() => {
    const s = getSocket();
    setConnected(s.connected);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
    };
  }, []);

  const portals = [
    {
      id: 'customer',
      label: 'Customer Storefront',
      icon: <ShoppingBag size={14} />,
      path: '/my-orders',
      activeMatcher: (p: string) => !p.startsWith('/admin') && !p.startsWith('/delivery') && !p.startsWith('/merchant') && !p.startsWith('/vendor'),
      color: '#059669',
      bg: '#ecfdf5',
      demoEmail: 'user@onbuggy.com',
      demoPass: 'Password123!',
      role: 'customer',
    },
    {
      id: 'merchant',
      label: 'Merchant Partner',
      icon: <Store size={14} />,
      path: '/merchant',
      activeMatcher: (p: string) => p.startsWith('/merchant') || p.startsWith('/vendor'),
      color: '#2563eb',
      bg: '#eff6ff',
      demoEmail: 'merchant@onbuggy.com',
      demoPass: 'MerchantPassword123!',
      role: 'shopkeeper',
    },
    {
      id: 'delivery',
      label: 'Delivery Boy',
      icon: <Bike size={14} />,
      path: '/delivery',
      activeMatcher: (p: string) => p.startsWith('/delivery'),
      color: '#047857',
      bg: '#ecfdf5',
      demoEmail: 'rider@onbuggy.com',
      demoPass: 'RiderPassword123!',
      role: 'delivery',
    },
    {
      id: 'admin',
      label: 'Admin Command',
      icon: <ShieldAlert size={14} />,
      path: '/admin',
      activeMatcher: (p: string) => p.startsWith('/admin'),
      color: '#dc2626',
      bg: '#fef2f2',
      demoEmail: 'admin@onbuggy.com',
      demoPass: 'AdminPassword123!',
      role: 'admin',
    },
  ];

  const handleQuickSwitchRole = async (portal: typeof portals[0]) => {
    if (user?.role !== portal.role) {
      await login(portal.demoEmail, portal.demoPass);
    }
    navigate(portal.path);
  };

  if (dismissed) {
    return null;
  }

  if (minimized) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 999,
          backgroundColor: '#0f172a',
          color: '#ffffff',
          borderRadius: '9999px',
          padding: '6px 12px 6px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.25)',
          fontSize: '0.78rem',
          border: '1px solid rgba(255,255,255,0.18)',
        }}
      >
        <div
          onClick={() => {
            setMinimized(false);
            localStorage.setItem('portalBarMinimized', 'false');
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          title="Click to expand Multi-Role Portal Switcher"
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: connected ? '#10b981' : '#f59e0b',
              boxShadow: connected ? '0 0 8px #10b981' : 'none',
            }}
          />
          <span style={{ fontWeight: 700 }}>Portals</span>
          <ChevronDown size={14} />
        </div>

        <button
          type="button"
          onClick={() => {
            setDismissed(true);
            localStorage.setItem('portalBarDismissed', 'true');
          }}
          aria-label="Dismiss portals badge"
          title="Dismiss completely"
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            marginLeft: '4px',
            borderLeft: '1px solid rgba(255,255,255,0.2)',
            paddingLeft: '6px',
          }}
        >
          <X size={13} />
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="Multi-Role Portal Switcher"
      style={{
        backgroundColor: '#0f172a',
        color: '#ffffff',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '6px 16px',
        fontSize: '0.8rem',
        position: 'sticky',
        top: 0,
        zIndex: 110,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      <div
        style={{
          maxWidth: '1350px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        {/* Left: Real-time Socket Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: connected ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
              color: connected ? '#34d399' : '#fbbf24',
              padding: '3px 8px',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '0.72rem',
              border: connected ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(251,191,36,0.3)',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: connected ? '#10b981' : '#f59e0b',
                boxShadow: connected ? '0 0 6px #10b981' : 'none',
              }}
            />
            {connected ? 'REAL-TIME WEBSOCKET LIVE' : 'CONNECTING WS...'}
          </span>
          <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'none' }} className="portal-label">
            Multi-Role Ecosystem
          </span>
        </div>

        {/* Center: The 4 Portals Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {portals.map((p) => {
            const isCurrent = p.activeMatcher(location.pathname);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleQuickSwitchRole(p)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: isCurrent ? 800 : 600,
                  border: isCurrent ? `1px solid ${p.color}` : '1px solid rgba(255,255,255,0.12)',
                  backgroundColor: isCurrent ? p.color : 'rgba(255,255,255,0.06)',
                  color: isCurrent ? '#ffffff' : '#cbd5e1',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isCurrent ? `0 2px 8px ${p.color}44` : 'none',
                }}
              >
                {p.icon}
                <span>{p.label}</span>
                {isCurrent && (
                  <span
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Current Active User badge & Minimize toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
            Active: <strong style={{ color: '#f1f5f9' }}>{user?.name || 'Guest'}</strong> (
            <span style={{ color: '#38bdf8', textTransform: 'capitalize' }}>{user?.role || 'customer'}</span>)
          </span>

          <button
            type="button"
            onClick={() => {
              setMinimized(true);
              localStorage.setItem('portalBarMinimized', 'true');
            }}
            aria-label="Minimize portal bar"
            title="Hide portal bar"
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ChevronUp size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
};

