import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { merchantService } from '../services/api';
import { Order, Shop, Product, MerchantStats } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { LiveRiderMap } from '../components/LiveRiderMap';
import {
  joinRoleRoom,
  subscribeToNewOrders,
  subscribeToOrderUpdates,
  subscribeToLocationUpdates,
  subscribeToShopStatus,
  subscribeToProductStock,
} from '../services/socket';
import {
  Store,
  ShoppingBag,
  Package,
  RotateCw,
  Clock,
  MapPin,
  Phone,
  Power,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  FileText,
  ExternalLink,
  Bike,
  Navigation,
  Eye,
  Check,
  X,
  Layers,
  Sparkles,
  Bell,
} from 'lucide-react';

export const MerchantPanelPage: React.FC = () => {
  useDocumentTitle('Merchant & Vendor Command Center - Onbuggy', 'Store dashboard for order processing, rider tracking, and inventory management.');

  const { user, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'store'>('orders');
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [togglingProductId, setTogglingProductId] = useState<string | null>(null);
  const [togglingStore, setTogglingStore] = useState(false);

  // Filter
  const [orderFilter, setOrderFilter] = useState<string>('all');

  // 1-Click Demo Merchant Login
  const handleLoginAsMerchant = async () => {
    setLoading(true);
    await login('merchant@onbuggy.com', 'MerchantPassword123!');
    setLoading(false);
  };

  const loadData = async (isManual = false) => {
    if (isManual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        merchantService.getStats(),
        merchantService.getOrders({ status: orderFilter === 'all' ? undefined : orderFilter }),
        merchantService.getProducts(),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (ordersRes.data.success) {
        setOrders(ordersRes.data.data);
      }
      if (productsRes.data.success) {
        setProducts(productsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load merchant data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const [liveAlert, setLiveAlert] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'shopkeeper' || user?.role === 'admin')) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user?.role, orderFilter]);

  // Real-time WebSocket subscriptions for Merchant portal
  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'shopkeeper' && user?.role !== 'admin')) return;

    joinRoleRoom('shopkeeper', stats?.shop?.name || user?.name);

    // 1. New incoming customer orders
    const unsubNewOrder = subscribeToNewOrders(({ order }) => {
      const currentShopName = stats?.shop?.name;
      if (!currentShopName || order.shopName === currentShopName || user?.role === 'admin') {
        setOrders((prev) => [order, ...prev.filter((o) => o._id !== order._id)]);
        setStats((prev) =>
          prev
            ? {
                ...prev,
                totalOrders: prev.totalOrders + 1,
                activeOrders: prev.activeOrders + 1,
              }
            : prev
        );
        setLiveAlert(`🔔 New Order #${order._id.slice(-6)} received from ${order.userName} for ${formatCurrency(order.grandTotal)}!`);
      }
    });

    // 2. Order status transitions (e.g. Rider picked up, delivered)
    const unsubStatus = subscribeToOrderUpdates(({ order }) => {
      setOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)));
      // Refresh stats quietly
      merchantService.getStats().then((res) => {
        if (res.data.success) setStats(res.data.data);
      }).catch(() => {});
    });

    // 3. Live Rider GPS updates for orders
    const unsubLocation = subscribeToLocationUpdates(({ orderId, deliveryLocation }) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, deliveryLocation } : o))
      );
    });

    // 4. Shop availability updates
    const unsubShop = subscribeToShopStatus(({ shop }) => {
      if (stats?.shop?._id === shop._id) {
        setStats((prev) => (prev ? { ...prev, shop } : prev));
      }
    });

    // 5. Product stock toggles
    const unsubStock = subscribeToProductStock(({ product }) => {
      setProducts((prev) => prev.map((p) => (p._id === product._id ? product : p)));
    });

    return () => {
      unsubNewOrder();
      unsubStatus();
      unsubLocation();
      unsubShop();
      unsubStock();
    };
  }, [isAuthenticated, user?.role, stats?.shop?.name, stats?.shop?._id]);

  // Auto-dismiss alert banner after 8 seconds
  useEffect(() => {
    if (!liveAlert) return;
    const timer = setTimeout(() => setLiveAlert(null), 8000);
    return () => clearTimeout(timer);
  }, [liveAlert]);

  // Handle Order Status (Accept order: Order Placed -> Processing)
  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string, note?: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await merchantService.updateOrderStatus(orderId, { status: nextStatus, note });
      if (res.data.success) {
        setOrders((prev) => prev.map((o) => (o._id === orderId ? res.data.data : o)));
        // Refresh stats
        const statsRes = await merchantService.getStats();
        if (statsRes.data.success) setStats(statsRes.data.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Toggle Stock availability
  const handleToggleStock = async (productId: string) => {
    setTogglingProductId(productId);
    try {
      const res = await merchantService.toggleStock(productId);
      if (res.data.success) {
        setProducts((prev) => prev.map((p) => (p._id === productId ? res.data.data : p)));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to toggle stock');
    } finally {
      setTogglingProductId(null);
    }
  };

  // Toggle Store Open / Closed
  const handleToggleStoreStatus = async () => {
    setTogglingStore(true);
    try {
      const res = await merchantService.toggleStoreStatus();
      if (res.data.success && stats) {
        setStats({
          ...stats,
          shop: res.data.data,
        });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to toggle store status');
    } finally {
      setTogglingStore(false);
    }
  };

  const isMerchantAuthorized = isAuthenticated && (user?.role === 'shopkeeper' || user?.role === 'admin');

  // Guard view when not authenticated
  if (!loading && !isMerchantAuthorized) {
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
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <Store size={38} />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
            Merchant & Store Partner Portal
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.98rem', lineHeight: 1.6, maxWidth: '480px', margin: '0 auto 2rem' }}>
            Manage your store orders, track approaching delivery riders on the live map, update item inventory, and toggle your store's availability in Rewa.
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
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                }}
              >
                ONE-CLICK DEMO MERCHANT
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Store: Kamal Medical Store (Rewa)</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#334155', margin: '4px 0' }}>
              <strong>Email:</strong> <code>merchant@onbuggy.com</code>
            </p>
            <p style={{ fontSize: '0.88rem', color: '#334155', margin: '4px 0' }}>
              <strong>Password:</strong> <code>MerchantPassword123!</code>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleLoginAsMerchant}
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
              <Store size={18} />
              Log in as Demo Merchant (Kamal Medical Store)
            </button>
            <Link
              to="/signin?redirect=/merchant"
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
              Custom Merchant Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const shop = stats?.shop;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 65px)', padding: '2rem 1rem 4rem' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        
        {/* Live Order Incoming Alert Banner */}
        {liveAlert && (
          <div
            style={{
              backgroundColor: '#ecfdf5',
              border: '2px solid #10b981',
              borderRadius: '16px',
              padding: '1rem 1.5rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              boxShadow: '0 8px 20px rgba(16,185,129,0.2)',
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
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  flexShrink: 0,
                }}
              >
                <Bell size={20} />
              </span>
              <div>
                <p style={{ margin: 0, fontWeight: 800, color: '#065f46', fontSize: '1rem' }}>
                  {liveAlert}
                </p>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#047857' }}>
                  Real-time notification received via WebSocket. Dashboard updated automatically.
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
                color: '#065f46',
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
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: 'rgba(37,99,235,0.2)',
                border: '1px solid rgba(37,99,235,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#60a5fa',
              }}
            >
              <Store size={32} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>
                  {shop?.name || 'Kamal Medical Store'}
                </h1>
                <span
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: '#cbd5e1',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    textTransform: 'uppercase',
                  }}
                >
                  {shop?.category || 'Medicine'}
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: '#94a3b8' }}>
                {shop?.address || 'Near Old Bus Stand, Civil Lines, Rewa'} • Rating: {shop?.rating || 4.8} ★
              </p>
            </div>
          </div>

          {/* Action buttons: Store Open/Closed Toggle & Refresh */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              disabled={togglingStore}
              onClick={handleToggleStoreStatus}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '9999px',
                fontSize: '0.86rem',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: shop?.isOpen ? '#059669' : '#dc2626',
                color: '#ffffff',
                boxShadow: shop?.isOpen
                  ? '0 0 14px rgba(16,185,129,0.4)'
                  : '0 0 14px rgba(220,38,38,0.4)',
                transition: 'all 0.2s ease',
              }}
            >
              <Power size={15} />
              {shop?.isOpen ? '🟢 Store is OPEN' : '🔴 Store is CLOSED'}
            </button>

            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing}
              aria-label="Refresh dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#ffffff',
                padding: '9px 14px',
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
                  padding: '9px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                Admin Panel <ArrowRight size={14} />
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
          {/* Store GMV Sales */}
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
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>Store Sales (GMV)</span>
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
                <ShoppingBag size={18} />
              </div>
            </div>
            <p style={{ fontSize: '1.85rem', fontWeight: 800, color: '#059669', margin: 0 }}>
              {formatCurrency(stats?.storeRevenue || 0)}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '4px 0 0' }}>
              Fulfilled on Onbuggy Rewa
            </p>
          </div>

          {/* Active Orders */}
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
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>Incoming & In-Flight</span>
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
              {stats?.activeOrders ?? 0}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#2563eb', margin: '4px 0 0' }}>
              Orders currently preparing / en route
            </p>
          </div>

          {/* Completed Orders */}
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
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>Delivered Orders</span>
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
                <CheckCircle2 size={18} />
              </div>
            </div>
            <p style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {stats?.completedOrders ?? 0}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '4px 0 0' }}>
              Total successful customer handovers
            </p>
          </div>

          {/* Catalog Products */}
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
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>Active Catalog</span>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Package size={18} />
              </div>
            </div>
            <p style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {stats?.inStockProducts ?? products.filter((p) => p.inStock).length} / {stats?.totalProducts ?? products.length}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#d97706', margin: '4px 0 0' }}>
              Products marked in stock
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
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
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '10px 18px',
              fontWeight: 700,
              fontSize: '0.9rem',
              borderRadius: '8px 8px 0 0',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'orders' ? '#ffffff' : 'transparent',
              color: activeTab === 'orders' ? '#0f172a' : '#64748b',
              borderBottom: activeTab === 'orders' ? '2px solid #0f172a' : '2px solid transparent',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Bike size={16} />
            Live Incoming Orders & Rider Radar ({orders.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            style={{
              padding: '10px 18px',
              fontWeight: 700,
              fontSize: '0.9rem',
              borderRadius: '8px 8px 0 0',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'inventory' ? '#ffffff' : 'transparent',
              color: activeTab === 'inventory' ? '#0f172a' : '#64748b',
              borderBottom: activeTab === 'inventory' ? '2px solid #0f172a' : '2px solid transparent',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Package size={16} />
            Store Catalog & Stock Inventory ({products.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('store')}
            style={{
              padding: '10px 18px',
              fontWeight: 700,
              fontSize: '0.9rem',
              borderRadius: '8px 8px 0 0',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'store' ? '#ffffff' : 'transparent',
              color: activeTab === 'store' ? '#0f172a' : '#64748b',
              borderBottom: activeTab === 'store' ? '2px solid #0f172a' : '2px solid transparent',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Store size={16} />
            Store Profile & Timings
          </button>
        </div>

        {/* Tab 1: Orders & Live Rider Radar */}
        {activeTab === 'orders' && (
          <div>
            {/* Filter buttons */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              {['all', 'Order Placed', 'Processing', 'Out for Delivery', 'Delivered'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setOrderFilter(st)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                    backgroundColor: orderFilter === st ? '#0f172a' : '#ffffff',
                    color: orderFilter === st ? '#ffffff' : '#475569',
                  }}
                >
                  {st === 'all' ? 'All Orders' : st}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem', color: '#0f172a' }} />
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading store orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '3rem 1.5rem',
                  textAlign: 'center',
                  border: '1px solid #e2e8f0',
                }}
              >
                <ShoppingBag size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#334155' }}>
                  No orders found for this store
                </h4>
                <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
                  Orders placed by customers for {shop?.name || 'this store'} will appear here automatically.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {orders.map((order) => {
                  const isPlaced = order.status === 'Order Placed';
                  const isProcessing = order.status === 'Processing';
                  const isOut = order.status === 'Out for Delivery';
                  const isDelivered = order.status === 'Delivered';

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
                          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.98rem' }}>
                            Order #{order.orderNumber}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            Placed {formatDate(order.createdAt)}
                          </span>
                        </div>

                        {/* Status Chip */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            style={{
                              backgroundColor: isPlaced
                                ? '#eff6ff'
                                : isProcessing
                                ? '#fef3c7'
                                : isOut
                                ? '#ecfdf5'
                                : '#f1f5f9',
                              color: isPlaced
                                ? '#1d4ed8'
                                : isProcessing
                                ? '#b45309'
                                : isOut
                                ? '#047857'
                                : '#334155',
                              fontWeight: 800,
                              fontSize: '0.8rem',
                              padding: '4px 10px',
                              borderRadius: '9999px',
                            }}
                          >
                            ● {order.status}
                          </span>

                          {/* Merchant Action Buttons */}
                          {isPlaced && (
                            <button
                              type="button"
                              disabled={updatingOrderId === order._id}
                              onClick={() =>
                                handleUpdateOrderStatus(
                                  order._id,
                                  'Processing',
                                  'Merchant accepted order and began packaging'
                                )
                              }
                              style={{
                                backgroundColor: 'var(--primary)',
                                color: '#064e3b',
                                border: 'none',
                                padding: '6px 14px',
                                borderRadius: '8px',
                                fontWeight: 800,
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                              }}
                            >
                              Accept & Prepare Order
                            </button>
                          )}

                          {isProcessing && (
                            <button
                              type="button"
                              disabled={updatingOrderId === order._id}
                              onClick={() =>
                                handleUpdateOrderStatus(
                                  order._id,
                                  'Out for Delivery',
                                  'Merchant handed package to rider'
                                )
                              }
                              style={{
                                backgroundColor: '#2563eb',
                                color: '#ffffff',
                                border: 'none',
                                padding: '6px 14px',
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                              }}
                            >
                              Hand to Rider (Out for Delivery)
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Main Order Details: Customer & Items */}
                      <div style={{ padding: '18px' }}>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '1.25rem',
                            marginBottom: '1.25rem',
                          }}
                        >
                          {/* Customer Section */}
                          <div
                            style={{
                              backgroundColor: '#f8fafc',
                              borderRadius: '12px',
                              padding: '14px',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                              Customer Information
                            </span>
                            <h4 style={{ margin: '4px 0 2px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                              {order.customerName || order.userName}
                            </h4>
                            <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#475569' }}>
                              {order.deliveryAddress}
                            </p>
                            <a
                              href={`tel:${order.customerPhone || order.userPhone}`}
                              style={{
                                color: '#2563eb',
                                fontSize: '0.84rem',
                                fontWeight: 700,
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              <Phone size={13} /> {order.customerPhone || order.userPhone}
                            </a>
                          </div>

                          {/* Delivery Partner Assigned */}
                          <div
                            style={{
                              backgroundColor: '#eff6ff',
                              borderRadius: '12px',
                              padding: '14px',
                              border: '1px solid #bfdbfe',
                            }}
                          >
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase' }}>
                              Assigned Delivery Partner
                            </span>
                            <h4 style={{ margin: '4px 0 2px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                              {order.deliveryPersonnel || 'Sunil Verma (Hero Splendor)'}
                            </h4>
                            <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#1e40af' }}>
                              {order.deliveryLocation?.statusText || 'Rider active on Rewa fleet'}
                            </p>
                            <a
                              href="tel:9826112233"
                              style={{
                                color: '#1d4ed8',
                                fontSize: '0.84rem',
                                fontWeight: 700,
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              <Phone size={13} /> Call Rider (Sunil Verma)
                            </a>
                          </div>
                        </div>

                        {/* Prescription slip alert */}
                        {order.prescriptionImageUrl && (
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
                                Customer uploaded prescription slip for Schedule H medicines
                              </span>
                            </div>
                            <a
                              href={order.prescriptionImageUrl}
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
                              View Prescription Slip <ExternalLink size={12} />
                            </a>
                          </div>
                        )}

                        {/* Embedded Real-time Rider Location Map Radar */}
                        <div style={{ marginBottom: '1.25rem' }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '8px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Bike size={16} color="#059669" />
                              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                                Live Delivery Boy Location Radar
                              </span>
                            </div>
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                              Real-time GPS tracking between {order.shopName} and customer
                            </span>
                          </div>
                          <LiveRiderMap order={order} height="280px" />
                        </div>

                        {/* Items Breakdown Table */}
                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                          <h5 style={{ margin: '0 0 8px', fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>
                            Order Items to Prepare:
                          </h5>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {order.items.map((it, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontSize: '0.86rem',
                                  color: '#475569',
                                }}
                              >
                                <span>
                                  {it.quantity}x {it.name} ({it.unit})
                                </span>
                                <strong>{formatCurrency(it.price * it.quantity)}</strong>
                              </div>
                            ))}
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              borderTop: '1px dashed #e2e8f0',
                              marginTop: '10px',
                              paddingTop: '8px',
                            }}
                          >
                            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                              Store Order Total:
                            </span>
                            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669' }}>
                              {formatCurrency(order.subtotal || order.grandTotal)}
                            </span>
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

        {/* Tab 2: Store Catalog & Stock Management */}
        {activeTab === 'inventory' && (
          <div>
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                    Live Inventory Management
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                    Instantly toggle items in-stock or out-of-stock. Changes appear immediately on the customer storefront.
                  </p>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Item</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Category</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Selling Price</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Pack Unit</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Stock Toggle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((prod) => (
                      <tr key={prod._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={prod.image.startsWith('http') || prod.image.startsWith('/') ? prod.image : `/${prod.image}`}
                            alt={prod.name}
                            style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '6px' }}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div>
                            <strong style={{ color: '#0f172a' }}>{prod.name}</strong>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', textTransform: 'capitalize', color: '#64748b' }}>
                          {prod.category}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                          {formatCurrency(prod.price)}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#64748b' }}>{prod.unit}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              backgroundColor: prod.inStock ? '#ecfdf5' : '#fee2e2',
                              color: prod.inStock ? '#047857' : '#b91c1c',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: '9999px',
                            }}
                          >
                            {prod.inStock ? '● In Stock' : '○ Out of Stock'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <button
                            type="button"
                            disabled={togglingProductId === prod._id}
                            onClick={() => handleToggleStock(prod._id)}
                            style={{
                              backgroundColor: prod.inStock ? '#fee2e2' : '#ecfdf5',
                              color: prod.inStock ? '#b91c1c' : '#047857',
                              border: prod.inStock ? '1px solid #fecaca' : '1px solid #a7f3d0',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            {togglingProductId === prod._id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : prod.inStock ? (
                              <X size={12} />
                            ) : (
                              <Check size={12} />
                            )}
                            {prod.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Store Profile & Timings */}
        {activeTab === 'store' && (
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
                <Store size={20} color="#2563eb" />
                Store Credentials & Address
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: '#475569' }}>
                <p style={{ margin: 0 }}>
                  <strong>Trade Name:</strong> {shop?.name}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Category:</strong> {shop?.categoryLabel}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Address:</strong> {shop?.address}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Store Contact:</strong> {shop?.phone}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Delivery Coverage:</strong> 5.0 km radial radius in Rewa
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Operational Timings:</strong> 8:00 AM – 10:00 PM (Daily)
                </p>
              </div>
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
                <CheckCircle2 size={20} color="#059669" />
                Merchant Fulfilment Standards
              </h3>
              <ul style={{ paddingLeft: '1.25rem', color: '#475569', fontSize: '0.9rem', lineHeight: 1.7 }}>
                <li>
                  <strong>5-Minute Packaging:</strong> Orders should be packed within 5 minutes of customer placement so riders can pick up immediately.
                </li>
                <li>
                  <strong>Prescription Scrutiny:</strong> For Schedule H drugs, verify doctor's registration number on uploaded prescription before handing to rider.
                </li>
                <li>
                  <strong>Freshness Guarantee:</strong> Ensure sealed packaging with tamper-evident labels.
                </li>
                <li>
                  <strong>Merchant Payouts:</strong> Direct bank settlement via NEFT/UPI occurs every Tuesday and Friday for completed orders.
                </li>
              </ul>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

