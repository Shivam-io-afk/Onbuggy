import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { deliveryService } from '../services/api';
import { Order } from '../types';
import { LiveRiderMap } from '../components/LiveRiderMap';
import { DeliveryPaymentModal } from '../components/DeliveryPaymentModal';
import {
  joinRoleRoom,
  subscribeToNewOrders,
  subscribeToOrderUpdates,
  subscribeToLocationUpdates,
  subscribeToPaymentCollected,
} from '../services/socket';
import { formatCurrency, formatDate } from '../utils/format';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  Bike,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  PackageCheck,
  RotateCw,
  Clock,
  DollarSign,
  AlertCircle,
  FileText,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Loader2,
  Power,
  Store,
  Check,
  AlertTriangle,
  ArrowRight,
  ShoppingBag,
  Bell,
  QrCode,
} from 'lucide-react';

export const DeliveryPanelPage: React.FC = () => {
  useDocumentTitle('Delivery Rider Portal - Onbuggy', 'Driver order dispatch, live routing, store pickups, and customer door-step handovers.');

  const { user, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'profile'>('active');

  // Sync tab with URL search parameter if provided (?tab=active | history | profile)
  useEffect(() => {
    const tabParam = searchParams.get('tab') as 'active' | 'history' | 'profile' | null;
    if (tabParam && ['active', 'history', 'profile'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const [stats, setStats] = useState<{
    riderName: string;
    activeTrips: number;
    completedTrips: number;
    cashCollected: number;
    upiCollected?: number;
    totalCollected?: number;
    earnedPayout: number;
  } | null>(null);

  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Online / Offline state
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return localStorage.getItem('onbuggy_rider_online') !== 'false';
  });

  // Sync duty status with Navbar or other tabs
  useEffect(() => {
    const handleDutyChange = () => {
      setIsOnline(localStorage.getItem('onbuggy_rider_online') !== 'false');
    };
    window.addEventListener('onbuggy_duty_changed', handleDutyChange);
    window.addEventListener('storage', handleDutyChange);
    return () => {
      window.removeEventListener('onbuggy_duty_changed', handleDutyChange);
      window.removeEventListener('storage', handleDutyChange);
    };
  }, []);

  // Delivery confirmation modal
  const [confirmModalOrder, setConfirmModalOrder] = useState<Order | null>(null);
  const [deliveryNote, setDeliveryNote] = useState('');

  // 1-Click Dev Rider login
  const handleLoginAsRider = async () => {
    setLoading(true);
    await login('rider@onbuggy.com', 'RiderPassword123!');
    setLoading(false);
  };

  const toggleDutyStatus = () => {
    const next = !isOnline;
    setIsOnline(next);
    localStorage.setItem('onbuggy_rider_online', String(next));
    window.dispatchEvent(new Event('onbuggy_duty_changed'));
  };

  const loadData = async (isManual = false) => {
    if (isManual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [statsRes, activeRes, histRes] = await Promise.all([
        deliveryService.getStats(),
        deliveryService.getOrders({ filter: 'active' }),
        deliveryService.getOrders({ filter: 'delivered' }),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (activeRes.data.success) {
        setActiveOrders(activeRes.data.data);
      }
      if (histRes.data.success) {
        setHistoryOrders(histRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load delivery rider data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const [liveAlert, setLiveAlert] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'delivery' || user?.role === 'admin')) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user?.role]);

  // Real-time WebSocket subscriptions for Delivery Rider portal
  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'delivery' && user?.role !== 'admin')) return;

    joinRoleRoom('delivery');

    // 1. New incoming dispatch orders
    const unsubNewOrder = subscribeToNewOrders(({ order }) => {
      if (order.status !== 'Delivered' && order.status !== 'Cancelled') {
        setActiveOrders((prev) => [order, ...prev.filter((o) => o._id !== order._id)]);
        setLiveAlert(`⚡ New Dispatch: Order #${order._id.slice(-6)} from ${order.shopName} (${formatCurrency(order.grandTotal)}) is ready!`);
      }
    });

    // 2. Order status transitions
    const unsubStatus = subscribeToOrderUpdates(({ order }) => {
      if (order.status === 'Delivered' || order.status === 'Cancelled') {
        setActiveOrders((prev) => prev.filter((o) => o._id !== order._id));
        setHistoryOrders((prev) => [order, ...prev.filter((o) => o._id !== order._id)]);
      } else {
        setActiveOrders((prev) => {
          const exists = prev.some((o) => o._id === order._id);
          if (exists) {
            return prev.map((o) => (o._id === order._id ? order : o));
          } else {
            return [order, ...prev];
          }
        });
      }
      deliveryService.getStats().then((res) => {
        if (res.data.success) setStats(res.data.data);
      }).catch(() => {});
    });

    // 3. Location updates
    const unsubLocation = subscribeToLocationUpdates(({ orderId, deliveryLocation }) => {
      setActiveOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, deliveryLocation } : o))
      );
    });

    // 4. Payment Collected updates
    const unsubPayment = subscribeToPaymentCollected(({ order }) => {
      if (order.status === 'Delivered') {
        setActiveOrders((prev) => prev.filter((o) => o._id !== order._id));
        setHistoryOrders((prev) => [order, ...prev.filter((o) => o._id !== order._id)]);
      } else {
        setActiveOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)));
      }
      deliveryService.getStats().then((res) => {
        if (res.data.success) setStats(res.data.data);
      }).catch(() => {});
    });

    return () => {
      unsubNewOrder();
      unsubStatus();
      unsubLocation();
      unsubPayment();
    };
  }, [isAuthenticated, user?.role]);

  // Auto-dismiss alert banner after 8 seconds
  useEffect(() => {
    if (!liveAlert) return;
    const timer = setTimeout(() => setLiveAlert(null), 8000);
    return () => clearTimeout(timer);
  }, [liveAlert]);

  // Handle Pickup: Processing -> Out for Delivery
  const handleConfirmPickup = async (order: Order) => {
    setUpdatingId(order._id);
    try {
      const res = await deliveryService.updateStatus(order._id, {
        status: 'Out for Delivery',
        note: `Picked up package from ${order.shopName}. En route to customer delivery location.`,
      });

      if (res.data.success) {
        // Move or update in active list
        setActiveOrders((prev) =>
          prev.map((o) => (o._id === order._id ? res.data.data : o))
        );
        // Refresh stats
        const statsRes = await deliveryService.getStats();
        if (statsRes.data.success) setStats(statsRes.data.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update pickup status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle Handover: Out for Delivery -> Delivered
  const handleConfirmHandover = async () => {
    if (!confirmModalOrder) return;
    const order = confirmModalOrder;
    setUpdatingId(order._id);

    try {
      const res = await deliveryService.updateStatus(order._id, {
        status: 'Delivered',
        note: deliveryNote.trim() || `Safely delivered to customer by ${user?.name || 'Sunil Verma'}.`,
      });

      if (res.data.success) {
        // Remove from active list, add to history list
        setActiveOrders((prev) => prev.filter((o) => o._id !== order._id));
        setHistoryOrders((prev) => [res.data.data, ...prev]);
        setConfirmModalOrder(null);
        setDeliveryNote('');

        // Refresh stats
        const statsRes = await deliveryService.getStats();
        if (statsRes.data.success) setStats(statsRes.data.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to complete delivery');
    } finally {
      setUpdatingId(null);
    }
  };

  const isRiderAuthorized = isAuthenticated && (user?.role === 'delivery' || user?.role === 'admin');

  // Guard view when not authenticated as rider or admin
  if (!loading && !isRiderAuthorized) {
    return (
      <div style={{ maxWidth: '700px', margin: '4rem auto', padding: '0 1rem' }}>
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '2.5rem',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              backgroundColor: '#ecfdf5',
              color: '#047857',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <Bike size={38} />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
            Onbuggy Rider Dispatch Portal
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.98rem', lineHeight: 1.6, maxWidth: '480px', margin: '0 auto 2rem' }}>
            This panel is restricted to verified delivery fleet partners in Rewa, MP. Please authenticate with your rider account to start accepting pickup and drop dispatches.
          </p>

          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '16px',
              padding: '1.25rem',
              marginBottom: '2rem',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
              <span
                style={{
                  backgroundColor: '#30e849',
                  color: '#064e3b',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                }}
              >
                ONE-CLICK DEMO RIDER
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Pre-configured fleet account</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#334155', margin: '4px 0' }}>
              <strong>Name:</strong> Sunil Verma (Hero Splendor MP-17-AB-4021)
            </p>
            <p style={{ fontSize: '0.88rem', color: '#334155', margin: '4px 0' }}>
              <strong>Email:</strong> <code>rider@onbuggy.com</code>
            </p>
            <p style={{ fontSize: '0.88rem', color: '#334155', margin: '4px 0' }}>
              <strong>Password:</strong> <code>RiderPassword123!</code>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleLoginAsRider}
              style={{
                backgroundColor: 'var(--primary)',
                color: '#064e3b',
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.95rem',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(48,232,73,0.3)',
              }}
            >
              <Bike size={18} />
              Log in as Demo Rider (Sunil Verma)
            </button>
            <Link
              to="/signin?redirect=/delivery"
              style={{
                backgroundColor: '#0f172a',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '0.95rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Custom Rider Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 65px)', padding: '2rem 1rem 4rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Live Dispatch Incoming Alert Banner */}
        {liveAlert && (
          <div
            style={{
              backgroundColor: '#eff6ff',
              border: '2px solid #3b82f6',
              borderRadius: '16px',
              padding: '1rem 1.5rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              boxShadow: '0 8px 20px rgba(59,130,246,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  flexShrink: 0,
                }}
              >
                <Bell size={20} />
              </span>
              <div>
                <p style={{ margin: 0, fontWeight: 800, color: '#1e3a8a', fontSize: '1rem' }}>
                  {liveAlert}
                </p>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#1d4ed8' }}>
                  Real-time dispatch alert received via WebSocket. Active pickups queue refreshed.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLiveAlert(null)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#1e3a8a',
                fontWeight: 700,
                fontSize: '1.2rem',
                padding: '4px',
              }}
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        )}

        {/* Top Header Card */}
        <div
          style={{
            backgroundColor: '#0f172a',
            color: '#ffffff',
            borderRadius: '20px',
            padding: '1.75rem',
            marginBottom: '1.75rem',
            boxShadow: '0 10px 25px rgba(15,23,42,0.15)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '14px',
                backgroundColor: 'rgba(48, 232, 73, 0.15)',
                border: '1px solid rgba(48, 232, 73, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
              }}
            >
              <Bike size={30} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>
                  Delivery Partner Dashboard
                </h1>
                <span
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: '#94a3b8',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                  }}
                >
                  REWA HUB
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: '#94a3b8' }}>
                Rider: <strong style={{ color: '#f1f5f9' }}>{user?.name || 'Sunil Verma'}</strong> • Vehicle: Hero Splendor (MP-17-AB-4021)
              </p>
            </div>
          </div>

          {/* Action pills: Online status & Refresh */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={toggleDutyStatus}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '9999px',
                fontSize: '0.84rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: isOnline ? '#059669' : '#475569',
                color: '#ffffff',
                boxShadow: isOnline ? '0 0 14px rgba(16,185,129,0.4)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <Power size={14} />
              {isOnline ? '🟢 On Duty (Accepting Dispatches)' : '⚪ Off Duty (Paused)'}
            </button>

            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing}
              aria-label="Refresh deliveries"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#ffffff',
                padding: '8px 14px',
                borderRadius: '9999px',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RotateCw size={14} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Syncing...' : 'Sync'}
            </button>

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  color: '#cbd5e1',
                  border: '1px solid rgba(255,255,255,0.12)',
                  padding: '8px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                Go to Admin
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>

        {/* 4 Metric KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '1.75rem',
          }}
        >
          {/* Active Trips */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '1.25rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>Assigned Pickups</span>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bike size={18} />
              </div>
            </div>
            <p style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {stats?.activeTrips ?? activeOrders.length}
            </p>
            <p style={{ fontSize: '0.75rem', color: activeOrders.length > 0 ? '#2563eb' : '#64748b', margin: '4px 0 0' }}>
              {activeOrders.length > 0 ? '● In-flight orders need action' : 'No pending pickups'}
            </p>
          </div>

          {/* Completed Trips */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '1.25rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>Completed Deliveries</span>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle2 size={18} />
              </div>
            </div>
            <p style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {stats?.completedTrips ?? historyOrders.length}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#059669', margin: '4px 0 0' }}>
              Rewa Doorstep Fulfilled
            </p>
          </div>

          {/* COD Cash to Remit */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '1.25rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>COD Cash in Hand</span>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#fffbeb',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DollarSign size={18} />
              </div>
            </div>
            <p style={{ fontSize: '1.85rem', fontWeight: 800, color: '#d97706', margin: 0 }}>
              {formatCurrency(stats?.cashCollected || 0)}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#b45309', margin: '4px 0 0' }}>
              Cash in hand • UPI QR: {formatCurrency(stats?.upiCollected || 0)}
            </p>
          </div>

          {/* Payouts Earned */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '1.25rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>Trip Earnings</span>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#f1f5f9',
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PackageCheck size={18} />
              </div>
            </div>
            <p style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {formatCurrency(stats?.earnedPayout || (stats?.completedTrips || 0) * 30)}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '4px 0 0' }}>
              ₹30 flat reward per completed drop
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1px solid #e2e8f0',
            marginBottom: '1.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            style={{
              padding: '10px 18px',
              fontWeight: 700,
              fontSize: '0.9rem',
              borderRadius: '8px 8px 0 0',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'active' ? '#ffffff' : 'transparent',
              color: activeTab === 'active' ? '#0f172a' : '#64748b',
              borderBottom: activeTab === 'active' ? '2px solid #0f172a' : '2px solid transparent',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Bike size={16} />
            Active Pickups & Dispatches
            {activeOrders.length > 0 && (
              <span
                style={{
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  padding: '1px 6px',
                  borderRadius: '9999px',
                }}
              >
                {activeOrders.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            style={{
              padding: '10px 18px',
              fontWeight: 700,
              fontSize: '0.9rem',
              borderRadius: '8px 8px 0 0',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'history' ? '#ffffff' : 'transparent',
              color: activeTab === 'history' ? '#0f172a' : '#64748b',
              borderBottom: activeTab === 'history' ? '2px solid #0f172a' : '2px solid transparent',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={16} />
            Completed Delivery History ({historyOrders.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '10px 18px',
              fontWeight: 700,
              fontSize: '0.9rem',
              borderRadius: '8px 8px 0 0',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'profile' ? '#ffffff' : 'transparent',
              color: activeTab === 'profile' ? '#0f172a' : '#64748b',
              borderBottom: activeTab === 'profile' ? '2px solid #0f172a' : '2px solid transparent',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <ShieldCheck size={16} />
            Rider Guidelines & Safety
          </button>
        </div>

        {/* Tab 1: Active Pickups & Orders */}
        {activeTab === 'active' && (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem', color: '#0f172a' }} />
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Fetching live dispatches for Rewa Hub...</p>
              </div>
            ) : activeOrders.length === 0 ? (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '3.5rem 1.5rem',
                  textAlign: 'center',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    backgroundColor: '#ecfdf5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                  }}
                >
                  <Check size={32} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                  No Active Dispatches at the Moment
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                  All assigned orders have been safely delivered to customer doorsteps in Rewa. Stay online to receive the next batch of orders.
                </p>
                <button
                  type="button"
                  onClick={() => loadData(true)}
                  style={{
                    backgroundColor: '#f1f5f9',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <RotateCw size={14} /> Refresh Dispatch Queue
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {activeOrders.map((order) => {
                  const isProcessing = order.status === 'Processing';
                  const isOutForDelivery = order.status === 'Out for Delivery';
                  const isCOD = order.paymentMethod?.includes('COD') || order.paymentMethod?.includes('Delivery');
                  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    `${order.deliveryAddress}, Rewa, Madhya Pradesh`
                  )}`;

                  return (
                    <div
                      key={order._id}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Order top bar */}
                      <div
                        style={{
                          backgroundColor: '#f8fafc',
                          padding: '12px 18px',
                          borderBottom: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                            Order #{order.orderNumber}
                          </span>
                          <span
                            style={{
                              backgroundColor:
                                order.category === 'medicine'
                                  ? '#eff6ff'
                                  : order.category === 'grocery'
                                  ? '#fef3c7'
                                  : '#ecfdf5',
                              color:
                                order.category === 'medicine'
                                  ? '#1d4ed8'
                                  : order.category === 'grocery'
                                  ? '#b45309'
                                  : '#047857',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '2px 8px',
                              borderRadius: '4px',
                            }}
                          >
                            {order.category}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            {formatDate(order.createdAt)}
                          </span>
                        </div>

                        {/* Status Chip */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              backgroundColor: isProcessing ? '#fef3c7' : '#ecfdf5',
                              color: isProcessing ? '#b45309' : '#047857',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              padding: '4px 10px',
                              borderRadius: '9999px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <span
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: isProcessing ? '#f59e0b' : '#10b981',
                              }}
                            />
                            {isProcessing ? 'Store Ready (Awaiting Pickup)' : 'Out for Delivery (On the Way)'}
                          </span>
                        </div>
                      </div>

                      {/* Main card body: Store & Customer Details */}
                      <div style={{ padding: '18px' }}>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '1.25rem',
                            marginBottom: '1.25rem',
                          }}
                        >
                          {/* Store Pickup Section */}
                          <div
                            style={{
                              backgroundColor: '#f8fafc',
                              borderRadius: '12px',
                              padding: '14px',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                              <Store size={18} color="#2563eb" />
                              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                                1. Pickup From Merchant
                              </span>
                            </div>
                            <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                              {order.shopName}
                            </h4>
                            <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#64748b' }}>
                              Market Yard, Rewa, MP (Verified Local Merchant)
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span
                                style={{
                                  fontSize: '0.78rem',
                                  color: '#059669',
                                  fontWeight: 600,
                                  backgroundColor: '#ecfdf5',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                }}
                              >
                                Packaging verified
                              </span>
                            </div>
                          </div>

                          {/* Customer Drop-off Section */}
                          <div
                            style={{
                              backgroundColor: '#eff6ff',
                              borderRadius: '12px',
                              padding: '14px',
                              border: '1px solid #bfdbfe',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                              <MapPin size={18} color="#1d4ed8" />
                              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase' }}>
                                2. Doorstep Handover To
                              </span>
                            </div>
                            <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                              {order.customerName}
                            </h4>
                            <p style={{ margin: '0 0 10px', fontSize: '0.88rem', color: '#334155', fontWeight: 500 }}>
                              {order.deliveryAddress}
                            </p>

                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <a
                                href={`tel:${order.customerPhone}`}
                                style={{
                                  backgroundColor: '#ffffff',
                                  color: '#1d4ed8',
                                  border: '1px solid #bfdbfe',
                                  borderRadius: '8px',
                                  padding: '6px 12px',
                                  fontSize: '0.82rem',
                                  fontWeight: 700,
                                  textDecoration: 'none',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                }}
                              >
                                <Phone size={14} /> Call Customer ({order.customerPhone})
                              </a>

                              <a
                                href={googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  backgroundColor: '#1d4ed8',
                                  color: '#ffffff',
                                  borderRadius: '8px',
                                  padding: '6px 12px',
                                  fontSize: '0.82rem',
                                  fontWeight: 700,
                                  textDecoration: 'none',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                }}
                              >
                                <Navigation size={14} /> Start GPS Directions
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Prescription warning if present */}
                        {order.prescriptionUrl && (
                          <div
                            style={{
                              backgroundColor: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              borderRadius: '10px',
                              padding: '10px 14px',
                              marginBottom: '1.25rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <FileText size={16} color="#047857" />
                              <span style={{ fontSize: '0.84rem', color: '#065f46', fontWeight: 600 }}>
                                Prescription Verified by Pharmacist — Check patient name matches at doorstep
                              </span>
                            </div>
                            <a
                              href={order.prescriptionUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: '0.8rem',
                                color: '#047857',
                                fontWeight: 700,
                                textDecoration: 'underline',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              View Slip <ExternalLink size={12} />
                            </a>
                          </div>
                        )}

                        {/* Live Route Radar Map for Rider */}
                        <div style={{ marginBottom: '1.25rem' }}>
                          <LiveRiderMap order={order} height="260px" />
                        </div>

                        {/* Order Items & Total Banner */}
                        <div
                          style={{
                            borderTop: '1px solid #f1f5f9',
                            paddingTop: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '12px',
                          }}
                        >
                          <div>
                            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                              Package Contents ({order.items.length} item{order.items.length > 1 ? 's' : ''}):{' '}
                            </span>
                            <strong style={{ fontSize: '0.85rem', color: '#334155' }}>
                              {order.items.map((it) => `${it.name} (x${it.quantity})`).join(', ')}
                            </strong>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                {order.isPaid ? 'Payment Received' : isCOD ? 'Cash on Delivery to Collect:' : 'Online Payment:'}
                              </div>
                              <div
                                style={{
                                  fontSize: '1.15rem',
                                  fontWeight: 800,
                                  color: order.isPaid ? '#059669' : '#d97706',
                                }}
                              >
                                {formatCurrency(order.grandTotal)}
                              </div>
                            </div>

                            {/* Status Progression Button */}
                            {isProcessing && (
                              <button
                                type="button"
                                disabled={updatingId === order._id}
                                onClick={() => handleConfirmPickup(order)}
                                style={{
                                  backgroundColor: '#2563eb',
                                  color: '#ffffff',
                                  padding: '10px 18px',
                                  borderRadius: '10px',
                                  fontWeight: 700,
                                  fontSize: '0.88rem',
                                  border: 'none',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                                }}
                              >
                                {updatingId === order._id ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <Bike size={16} />
                                )}
                                Confirm Store Pickup
                              </button>
                            )}

                            {isOutForDelivery && (
                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmModalOrder(order);
                                  setDeliveryNote('');
                                }}
                                style={{
                                  backgroundColor: order.isPaid ? 'var(--primary)' : '#2563eb',
                                  color: order.isPaid ? '#064e3b' : '#ffffff',
                                  padding: '10px 18px',
                                  borderRadius: '10px',
                                  fontWeight: 800,
                                  fontSize: '0.88rem',
                                  border: 'none',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  boxShadow: order.isPaid
                                    ? '0 4px 12px rgba(48,232,73,0.3)'
                                    : '0 4px 14px rgba(37,99,235,0.35)',
                                }}
                              >
                                {order.isPaid ? (
                                  <>
                                    <CheckCircle2 size={16} />
                                    Complete Doorstep Handover
                                  </>
                                ) : (
                                  <>
                                    <QrCode size={16} />
                                    Collect ₹{order.grandTotal} (UPI / Cash)
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Trip History */}
        {activeTab === 'history' && (
          <div>
            {historyOrders.length === 0 ? (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '3rem 1.5rem',
                  textAlign: 'center',
                  border: '1px solid #e2e8f0',
                }}
              >
                <PackageCheck size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155' }}>
                  No Completed Orders Recorded Yet
                </h4>
                <p style={{ color: '#64748b', fontSize: '0.86rem' }}>
                  When you deliver orders and mark them complete, they will be archived here.
                </p>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>Order ID</th>
                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>Store</th>
                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>Customer</th>
                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>Delivery Location</th>
                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>Delivered At</th>
                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>Order Bill</th>
                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>Rider Payout</th>
                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyOrders.map((ord) => (
                        <tr key={ord._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                            #{ord.orderNumber}
                          </td>
                          <td style={{ padding: '12px 16px', color: '#334155' }}>{ord.shopName}</td>
                          <td style={{ padding: '12px 16px', color: '#334155' }}>{ord.customerName}</td>
                          <td style={{ padding: '12px 16px', color: '#64748b', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {ord.deliveryAddress}
                          </td>
                          <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.82rem' }}>
                            {formatDate(ord.updatedAt || ord.createdAt)}
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                            {formatCurrency(ord.grandTotal)}
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 700, color: '#059669' }}>
                            +₹30.00
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span
                              style={{
                                backgroundColor: '#ecfdf5',
                                color: '#047857',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                padding: '3px 8px',
                                borderRadius: '9999px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <CheckCircle2 size={12} /> Delivered
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Rider Guidelines & Protocol */}
        {activeTab === 'profile' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '1.75rem',
                border: '1px solid #e2e8f0',
              }}
            >
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="#059669" />
                Rewa Fleet Delivery Protocol
              </h3>
              <ul style={{ paddingLeft: '1.25rem', color: '#475569', fontSize: '0.9rem', lineHeight: 1.7 }}>
                <li>
                  <strong>20-Minute Fast Transit:</strong> Prioritize emergency medicine orders and temperature-sensitive essentials.
                </li>
                <li>
                  <strong>Prescription Verifications:</strong> For pharmacy orders, ensure the recipient's phone number or prescription match matches before handing over Schedule H items.
                </li>
                <li>
                  <strong>Cash on Delivery (COD):</strong> Collect exact grand total before completing handover. Turn in daily cash collections to Rewa Hub lead by 8:00 PM.
                </li>
                <li>
                  <strong>Customer Contact:</strong> Masked calling is enabled. If customer does not answer within 5 minutes, call hub support.
                </li>
              </ul>
            </div>

            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '1.75rem',
                border: '1px solid #e2e8f0',
              }}
            >
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={20} color="#2563eb" />
                Emergency Fleet Helpline
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1rem' }}>
                Need roadside assistance, address dispute resolution, or police/ambulance support during transit?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a
                  href="tel:18001234567"
                  style={{
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '10px',
                    padding: '12px',
                    color: '#1d4ed8',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Dispatch Lead (Rewa Central)</span>
                  <span>1800-123-4567</span>
                </a>
                <a
                  href="tel:100"
                  style={{
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fecaca',
                    borderRadius: '10px',
                    padding: '12px',
                    color: '#b91c1c',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Rewa Police Emergency</span>
                  <span>100 / 112</span>
                </a>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Handover & Delivery Doorstep Payment Collection Modal */}
      {confirmModalOrder && (
        <DeliveryPaymentModal
          order={confirmModalOrder}
          isOpen={Boolean(confirmModalOrder)}
          onClose={() => setConfirmModalOrder(null)}
          onPaymentSuccess={(updatedOrder) => {
            setActiveOrders((prev) => prev.filter((o) => o._id !== updatedOrder._id));
            setHistoryOrders((prev) => [updatedOrder, ...prev.filter((o) => o._id !== updatedOrder._id)]);
            setConfirmModalOrder(null);
            deliveryService.getStats().then((res) => {
              if (res.data.success) setStats(res.data.data);
            }).catch(() => {});
          }}
        />
      )}
    </div>
  );
};

