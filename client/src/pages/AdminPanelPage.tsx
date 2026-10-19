import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/api';
import { Order, Shop, User, OrderStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { LiveRiderMap } from '../components/LiveRiderMap';
import { AdminInvoiceModal } from '../components/AdminInvoiceModal';
import { AdminAddShopModal } from '../components/AdminAddShopModal';
import {
  joinRoleRoom,
  subscribeToNewOrders,
  subscribeToOrderUpdates,
  subscribeToLocationUpdates,
  subscribeToShopStatus,
} from '../services/socket';
import {
  ShieldAlert,
  ShoppingBag,
  Store,
  Users,
  DollarSign,
  Truck,
  RotateCw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Filter,
  Eye,
  FileText,
  Phone,
  MapPin,
  Lock,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Bell,
  Printer,
  Plus,
  Trash2,
  Send,
  MessageSquare,
  Radio,
  Download,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const AdminPanelPage: React.FC = () => {
  useDocumentTitle('Management & Admin Panel - Onbuggy', 'Platform administration, order routing, merchant management, and user controls.');

  const { user, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<'orders' | 'financials' | 'fleet' | 'shops' | 'users' | 'broadcast' | 'analytics'>('orders');

  // Sync tab with URL search parameter if provided (?tab=orders | fleet | shops | etc.)
  useEffect(() => {
    const tabParam = searchParams.get('tab') as any;
    if (tabParam && ['orders', 'financials', 'fleet', 'shops', 'users', 'broadcast', 'analytics'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [financials, setFinancials] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<Order | null>(null);
  const [isAddShopOpen, setIsAddShopOpen] = useState(false);

  // Flash Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('⚡ Flash Weather Update from Rewa Hub');
  const [broadcastMsg, setBroadcastMsg] = useState('Heavy monsoon showers in Rewa city. Delivery partners are in transit with waterproof gear. Anticipate 5-10m delays.');
  const [broadcastType, setBroadcastType] = useState<'info' | 'warning' | 'emergency'>('warning');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastToast, setBroadcastToast] = useState<string | null>(null);

  // Filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Demo Admin login helper
  const handleLoginAsAdmin = async () => {
    setLoading(true);
    await login('admin@onbuggy.com', 'AdminPassword123!');
    setLoading(false);
  };

  const fetchData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [statsRes, ordersRes, shopsRes, usersRes, finRes] = await Promise.all([
        adminService.getStats(),
        adminService.getOrders({
          status: orderStatusFilter === 'all' ? undefined : orderStatusFilter,
          search: searchQuery.trim() || undefined,
        }),
        adminService.getShops(),
        adminService.getUsers(),
        adminService.getFinancials().catch(() => ({ data: { success: false, data: null } })),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (ordersRes.data.success) setOrders(ordersRes.data.data);
      if (shopsRes.data.success) setShops(shopsRes.data.data);
      if (usersRes.data.success) setUsersList(usersRes.data.data);
      if (finRes?.data?.success) setFinancials(finRes.data.data);
    } catch (err) {
      console.error('Failed to load admin panel data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const [liveAlert, setLiveAlert] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user?.role, orderStatusFilter]);

  // Real-time WebSocket subscriptions for Platform Admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') return;

    joinRoleRoom('admin');

    // 1. New incoming customer orders
    const unsubNewOrder = subscribeToNewOrders(({ order }) => {
      setOrders((prev) => [order, ...prev.filter((o) => o._id !== order._id)]);
      setStats((prev: any) =>
        prev
          ? {
              ...prev,
              totalOrders: (prev.totalOrders || 0) + 1,
              totalRevenue: (prev.totalRevenue || 0) + (order.grandTotal || 0),
            }
          : prev
      );
      setLiveAlert(`🔔 New Order Alert: #${order._id.slice(-6)} placed by ${order.userName} for ${formatCurrency(order.grandTotal)}!`);
    });

    // 2. Order status transitions
    const unsubStatus = subscribeToOrderUpdates(({ order }) => {
      setOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)));
      if (selectedOrder?._id === order._id) {
        setSelectedOrder(order);
      }
    });

    // 3. Location updates
    const unsubLocation = subscribeToLocationUpdates(({ orderId, deliveryLocation }) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, deliveryLocation } : o))
      );
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, deliveryLocation } : prev));
      }
    });

    // 4. Shop availability updates
    const unsubShop = subscribeToShopStatus(({ shop }) => {
      setShops((prev) => prev.map((s) => (s._id === shop._id ? shop : s)));
    });

    return () => {
      unsubNewOrder();
      unsubStatus();
      unsubLocation();
      unsubShop();
    };
  }, [isAuthenticated, user?.role, selectedOrder?._id]);

  // Auto-dismiss alert banner after 8 seconds
  useEffect(() => {
    if (!liveAlert) return;
    const timer = setTimeout(() => setLiveAlert(null), 8000);
    return () => clearTimeout(timer);
  }, [liveAlert]);

  // Handle status advance
  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await adminService.updateOrderStatus(orderId, { status: nextStatus });
      if (res.data.success) {
        setOrders((prev) => prev.map((o) => (o._id === orderId ? res.data.data : o)));
        if (selectedOrder?._id === orderId) {
          setSelectedOrder(res.data.data);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Handle assign rider
  const handleAssignRider = async (orderId: string, riderName: string) => {
    try {
      const res = await adminService.updateOrderStatus(orderId, { deliveryPersonnel: riderName });
      if (res.data.success) {
        setOrders((prev) => prev.map((o) => (o._id === orderId ? res.data.data : o)));
        if (selectedOrder?._id === orderId) {
          setSelectedOrder(res.data.data);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign rider');
    }
  };

  // Handle toggle shop
  const handleToggleShop = async (shopId: string) => {
    try {
      const res = await adminService.toggleShopStatus(shopId);
      if (res.data.success) {
        setShops((prev) => prev.map((s) => (s._id === shopId ? res.data.data : s)));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to toggle shop status');
    }
  };

  // Handle user role update
  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const res = await adminService.updateUserRole(userId, newRole);
      if (res.data.success) {
        setUsersList((prev) => prev.map((u) => (u.id === userId ? res.data.data : u)));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user role');
    }
  };

  // Handle delete shop
  const handleDeleteShop = async (shopId: string, shopName: string) => {
    const confirmed = window.confirm(`Are you sure you want to remove '${shopName}' from verified stores in Rewa?`);
    if (!confirmed) return;
    try {
      const res = await adminService.deleteShop(shopId);
      if (res.data.success) {
        setShops((prev) => prev.filter((s) => s._id !== shopId));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete shop');
    }
  };

  // Handle live broadcast alert
  const handleBroadcastAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;
    setIsBroadcasting(true);
    try {
      const res = await adminService.broadcastAlert({
        title: broadcastTitle,
        message: broadcastMsg,
        type: broadcastType,
      });
      if (res.data.success) {
        setBroadcastToast('Flash alert broadcasted in real time across the platform!');
        setTimeout(() => setBroadcastToast(null), 6000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to broadcast alert');
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Handle remittance confirmation
  const handleAcknowledgeRemittance = (riderName: string, amount: number) => {
    alert(`✓ Acknowledged: ${formatCurrency(amount)} physical cash remitted by rider ${riderName} into Rewa Hub safe.`);
    fetchData(true);
  };

  // Customer communication
  const handleWhatsAppCustomer = (ord: Order) => {
    const phone = (ord.userPhone || ord.customerPhone || '9876543210').replace(/\D/g, '');
    const msg = `Namaste ${ord.userName}, your Onbuggy order #${ord.orderNumber} is currently: ${ord.status}. Rider: ${ord.deliveryPersonnel || 'Sunil Verma'}. Track live here: https://onbuggy.com/my-orders`;
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // If not logged in as Admin, show restricted screen with 1-click demo login
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div style={{ maxWidth: '640px', margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '3rem 2rem',
            border: '1px solid #e2e8f0',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
            }}
          >
            <Lock size={32} color="#b91c1c" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--dark)', marginBottom: '0.75rem' }}>
            Admin Access Required
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            The Operations & Management Panel is restricted to authorized platform administrators. You are currently logged in as{' '}
            <strong>{user ? `${user.name} (${user.role})` : 'Guest (Signed Out)'}</strong>.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              type="button"
              onClick={handleLoginAsAdmin}
              style={{
                backgroundColor: 'var(--dark)',
                color: 'var(--primary)',
                fontWeight: 700,
                padding: '13px 20px',
                borderRadius: '12px',
                border: '1px solid var(--primary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '0.95rem',
              }}
            >
              <ShieldAlert size={18} /> Switch to Demo Admin Account (Admin Onbuggy)
            </button>
            <Link
              to="/signin"
              style={{
                backgroundColor: '#f1f5f9',
                color: '#334155',
                fontWeight: 600,
                padding: '11px 20px',
                borderRadius: '12px',
                textDecoration: 'none',
              }}
            >
              Sign In with Another Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1350px', margin: '0 auto', padding: '2rem 1.5rem 5rem 1.5rem' }}>
      {/* Real-time Order Incoming Alert Banner */}
      {liveAlert && (
        <div
          style={{
            backgroundColor: '#fef3c7',
            border: '2px solid #f59e0b',
            borderRadius: '16px',
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            boxShadow: '0 8px 20px rgba(245,158,11,0.2)',
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
                backgroundColor: '#d97706',
                color: '#ffffff',
                flexShrink: 0,
              }}
            >
              <Bell size={20} />
            </span>
            <div>
              <p style={{ margin: 0, fontWeight: 800, color: '#92400e', fontSize: '1rem' }}>
                {liveAlert}
              </p>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#b45309' }}>
                Platform metrics & order log updated instantly across real-time WebSockets.
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
              color: '#92400e',
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

      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                backgroundColor: 'var(--dark)',
                color: 'var(--primary)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.5px',
              }}
            >
              SUPER ADMIN
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--dark)', fontFamily: 'var(--font-brand)' }}>
              Onbuggy Command Center
            </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '4px' }}>
            Real-time fulfillment supervision, store statuses, rider assignments, and catalog controls.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link
            to="/delivery-panel"
            style={{
              backgroundColor: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
            }}
          >
            <Truck size={15} /> Rider Portal &rarr;
          </Link>

          <button
            type="button"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            style={{
              backgroundColor: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: refreshing ? 'not-allowed' : 'pointer',
            }}
          >
            <RotateCw size={14} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Live Refresh'}
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem',
          }}
        >
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Gross Revenue</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--dark)', marginTop: '4px' }}>
              {formatCurrency(stats.totalRevenue)}
            </div>
            <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>Active platform GMV</span>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Orders</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--dark)', marginTop: '4px' }}>
              {stats.totalOrders}
            </div>
            <span style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 600 }}>{stats.activeOrders} currently in delivery</span>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Merchant Stores</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--dark)', marginTop: '4px' }}>
              {stats.openStores} / {stats.totalStores}
            </div>
            <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 600 }}>Stores open right now</span>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Registered Network</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--dark)', marginTop: '4px' }}>
              {stats.totalUsers} Users
            </div>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{stats.totalRiders} Delivery Partners</span>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '1.75rem', overflowX: 'auto', paddingBottom: '2px' }}>
        {[
          { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
          { id: 'financials', label: 'Financials & Remittance', icon: DollarSign },
          { id: 'fleet', label: 'Live Fleet Radar', icon: Truck },
          { id: 'shops', label: `Stores (${shops.length})`, icon: Store },
          { id: 'users', label: `Users & Roles (${usersList.length})`, icon: Users },
          { id: 'broadcast', label: 'Broadcast Alerts', icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                fontSize: '0.95rem',
                fontWeight: isActive ? 800 : 600,
                color: isActive ? 'var(--dark)' : '#64748b',
                borderBottom: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                backgroundColor: 'transparent',
                cursor: 'pointer',
              }}
            >
              <Icon size={17} color={isActive ? 'var(--primary-hover)' : '#64748b'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div>
          {/* Controls Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['all', 'Order Placed', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setOrderStatusFilter(st)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: orderStatusFilter === st ? 700 : 500,
                    backgroundColor: orderStatusFilter === st ? 'var(--dark)' : '#ffffff',
                    color: orderStatusFilter === st ? 'var(--primary)' : '#475569',
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                  }}
                >
                  {st === 'all' ? 'All Orders' : st}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search orders, phone, store..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 34px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.86rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Orders Table */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '12px 16px' }}>Order #</th>
                    <th style={{ padding: '12px 16px' }}>Customer</th>
                    <th style={{ padding: '12px 16px' }}>Store Partner</th>
                    <th style={{ padding: '12px 16px' }}>Total & Pay Mode</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Assigned Rider</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                        No orders matching current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => {
                      const isDelivered = o.status === 'Delivered';
                      const isCancelled = o.status === 'Cancelled';
                      return (
                        <tr key={o._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '14px 16px', fontWeight: 800, color: 'var(--dark)' }}>
                            #{o.orderNumber}
                            <span style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 400 }}>
                              {formatDate(o.createdAt)}
                            </span>
                          </td>

                          <td style={{ padding: '14px 16px' }}>
                            <strong style={{ color: 'var(--dark)' }}>{o.userName}</strong>
                            <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b' }}>
                              {o.userPhone}
                            </span>
                          </td>

                          <td style={{ padding: '14px 16px', color: '#334155' }}>
                            {o.shopName}
                          </td>

                          <td style={{ padding: '14px 16px' }}>
                            <strong style={{ color: 'var(--dark)' }}>{formatCurrency(o.grandTotal)}</strong>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: o.isPaid ? '#16a34a' : '#ea580c', fontWeight: 600 }}>
                              {o.isPaid ? 'Paid' : 'COD (Pending)'}
                            </span>
                          </td>

                          <td style={{ padding: '14px 16px' }}>
                            <span
                              style={{
                                backgroundColor: isDelivered ? '#dcfce7' : isCancelled ? '#fee2e2' : '#e0f2fe',
                                color: isDelivered ? '#15803d' : isCancelled ? '#b91c1c' : '#0369a1',
                                padding: '4px 10px',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                              }}
                            >
                              {o.status}
                            </span>
                          </td>

                          <td style={{ padding: '14px 16px' }}>
                            <select
                              value={o.deliveryPersonnel || 'Sunil Verma'}
                              onChange={(e) => handleAssignRider(o._id, e.target.value)}
                              disabled={isDelivered || isCancelled}
                              style={{
                                padding: '5px 8px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.8rem',
                                backgroundColor: '#ffffff',
                                cursor: 'pointer',
                              }}
                            >
                              <option value="Sunil Verma">Sunil Verma</option>
                              <option value="Ramesh Yadav">Ramesh Yadav</option>
                              <option value="Amit Singh">Amit Singh</option>
                              <option value="Vikram Patel">Vikram Patel</option>
                            </select>
                          </td>

                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => setSelectedOrder(o)}
                                title="Inspect order details"
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  backgroundColor: '#f1f5f9',
                                  color: '#334155',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  border: 'none',
                                  cursor: 'pointer',
                                }}
                              >
                                View
                              </button>

                              {!isDelivered && !isCancelled && (
                                <button
                                  type="button"
                                  disabled={updatingOrderId === o._id}
                                  onClick={() => {
                                    const nextMap: Record<string, OrderStatus> = {
                                      'Order Placed': 'Processing',
                                      Processing: 'Out for Delivery',
                                      'Out for Delivery': 'Delivered',
                                    };
                                    const next = nextMap[o.status];
                                    if (next) handleUpdateStatus(o._id, next);
                                  }}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    backgroundColor: 'var(--primary)',
                                    color: '#064e3b',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    border: 'none',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Advance &rarr;
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: FINANCIALS & REMITTANCE LEDGER */}
      {activeTab === 'financials' && (
        <div>
          {/* Financial KPI Banner */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginBottom: '1.75rem',
            }}
          >
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Gross Revenue (GMV)</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--dark)', marginTop: '4px' }}>
                {formatCurrency(financials?.grossRevenue || stats?.totalRevenue || 0)}
              </div>
              <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>Total platform fulfilled GMV</span>
            </div>

            <div style={{ backgroundColor: '#fffbeb', borderRadius: '16px', padding: '1.25rem', border: '1.5px solid #fde68a', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 700, textTransform: 'uppercase' }}>COD Cash in Hand (to Remit)</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#b45309', marginTop: '4px' }}>
                {formatCurrency(financials?.totalCashCollected || 0)}
              </div>
              <span style={{ fontSize: '0.78rem', color: '#92400e' }}>Physical cash held by riders across Rewa</span>
            </div>

            <div style={{ backgroundColor: '#eff6ff', borderRadius: '16px', padding: '1.25rem', border: '1.5px solid #bfdbfe', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '0.8rem', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase' }}>Digital UPI BharatQR</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1d4ed8', marginTop: '4px' }}>
                {formatCurrency(financials?.totalUpiCollected || 0)}
              </div>
              <span style={{ fontSize: '0.78rem', color: '#2563eb' }}>Settled instantly via UPI VPA</span>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Taxes & Feeding India</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--dark)', marginTop: '4px' }}>
                {formatCurrency((financials?.totalTaxesCollected || 0) + (financials?.totalCharityCollected || 0))}
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                GST: {formatCurrency(financials?.totalTaxesCollected || 0)} • Charity: {formatCurrency(financials?.totalCharityCollected || 0)}
              </span>
            </div>
          </div>

          {/* Fleet Remittance Reconciliation Table */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, fontWeight: 800, color: '#0f172a', fontSize: '1.05rem' }}>
                  Delivery Partner Cash Remittance Ledger
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Daily hub hand-in reconciliation of doorstep cash collected by riders in Rewa
                </p>
              </div>
              <button
                type="button"
                onClick={() => fetchData(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                }}
              >
                <RotateCw size={13} className={refreshing ? 'animate-spin' : ''} />
                Refresh Ledger
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700 }}>
                    <th style={{ padding: '12px 16px' }}>Delivery Partner</th>
                    <th style={{ padding: '12px 16px' }}>Completed Trips</th>
                    <th style={{ padding: '12px 16px' }}>COD Cash in Hand</th>
                    <th style={{ padding: '12px 16px' }}>Digital UPI QR</th>
                    <th style={{ padding: '12px 16px' }}>Remittance Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Hub Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(financials?.riderLedger || [
                    { riderName: 'Sunil Verma', completedCount: 5, cashCollected: 724, upiCollected: 362 },
                    { riderName: 'Ramesh Yadav', completedCount: 3, cashCollected: 450, upiCollected: 180 },
                    { riderName: 'Amit Singh', completedCount: 2, cashCollected: 0, upiCollected: 520 },
                  ]).map((item: any, idx: number) => {
                    const hasPendingCash = item.cashCollected > 0;
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 800, color: 'var(--dark)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Truck size={16} color="var(--primary-hover)" />
                            {item.riderName}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#334155', fontWeight: 600 }}>
                          {item.completedCount} orders fulfilled
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 800, color: hasPendingCash ? '#d97706' : '#059669' }}>
                          {formatCurrency(item.cashCollected)}
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#2563eb' }}>
                          {formatCurrency(item.upiCollected)}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              backgroundColor: hasPendingCash ? '#fef3c7' : '#dcfce7',
                              color: hasPendingCash ? '#b45309' : '#15803d',
                              padding: '3px 10px',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {hasPendingCash ? '● Cash Pending Hand-in' : '✓ All Settled'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          {hasPendingCash ? (
                            <button
                              type="button"
                              onClick={() => handleAcknowledgeRemittance(item.riderName, item.cashCollected)}
                              style={{
                                backgroundColor: '#10b981',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Check size={13} /> Acknowledge Remittance
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>No Cash Due</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: LIVE FLEET RADAR MAP */}
      {activeTab === 'fleet' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark)' }}>
                Rewa Hyperlocal Delivery Fleet Radar
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                Real-time tracking of active orders, partner stores, and rider headings across Rewa
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 700 }}>
                ● {orders.filter((o) => o.status === 'Out for Delivery' || o.status === 'Processing').length} Active Dispatches
              </span>
            </div>
          </div>

          <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
            {orders.find((o) => o.status === 'Out for Delivery') ? (
              <LiveRiderMap order={orders.find((o) => o.status === 'Out for Delivery')!} height="480px" />
            ) : orders[0] ? (
              <LiveRiderMap order={orders[0]} height="480px" />
            ) : (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No active deliveries to track right now.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: STORE MANAGEMENT */}
      {activeTab === 'shops' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark)' }}>
                Verified Merchant Partner Stores ({shops.length})
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Manage local pharmacies, groceries, and vegetable vendors in Rewa
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddShopOpen(true)}
              style={{
                backgroundColor: 'var(--primary)',
                color: '#064e3b',
                padding: '9px 16px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.88rem',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(48,232,73,0.3)',
              }}
            >
              <Plus size={16} /> Onboard Store Partner
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {shops.map((s) => (
              <div
                key={s._id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--dark)', margin: '0 0 2px' }}>
                        {s.name}
                      </h3>
                      <span style={{ fontSize: '0.78rem', color: 'var(--primary-hover)', fontWeight: 700 }}>
                        {s.category.toUpperCase()} • {s.categoryLabel}
                      </span>
                    </div>
                    <span
                      style={{
                        backgroundColor: s.isOpen ? '#dcfce7' : '#fee2e2',
                        color: s.isOpen ? '#15803d' : '#b91c1c',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {s.isOpen ? 'OPEN' : 'CLOSED'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.45, marginBottom: '1rem' }}>
                    {s.description}
                  </p>

                  <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>📍 {s.address}</div>
                    <div>📞 {s.phone}</div>
                    <div>⭐ Rating: <strong>{s.rating}</strong> ({s.reviewCount} reviews) • {s.deliveryTimeMin}m avg</div>
                  </div>
                </div>

                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleToggleShop(s._id)}
                    style={{
                      flex: 1,
                      padding: '9px',
                      borderRadius: '8px',
                      backgroundColor: s.isOpen ? '#fee2e2' : '#ecfdf5',
                      color: s.isOpen ? '#b91c1c' : '#047857',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {s.isOpen ? 'Set Closed' : 'Set Open'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteShop(s._id, s.name)}
                    title="Remove store"
                    style={{
                      padding: '9px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#f1f5f9',
                      color: '#dc2626',
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: USERS & ROLE MANAGEMENT */}
      {activeTab === 'users' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '12px 16px' }}>User</th>
                  <th style={{ padding: '12px 16px' }}>Email</th>
                  <th style={{ padding: '12px 16px' }}>Phone</th>
                  <th style={{ padding: '12px 16px' }}>Current Role</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Assign Permission</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--dark)' }}>
                      {u.name}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>
                      {u.email}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>
                      {u.phone || '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          backgroundColor:
                            u.role === 'admin'
                              ? '#fef08a'
                              : u.role === 'delivery'
                              ? '#dcfce7'
                              : '#f1f5f9',
                          color:
                            u.role === 'admin'
                              ? '#854d0e'
                              : u.role === 'delivery'
                              ? '#15803d'
                              : '#334155',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          textTransform: 'uppercase',
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        style={{
                          padding: '5px 8px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.8rem',
                          backgroundColor: '#ffffff',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="customer">Customer</option>
                        <option value="delivery">Delivery Partner</option>
                        <option value="admin">Administrator</option>
                        <option value="shopkeeper">Shopkeeper</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: FLASH BROADCAST CENTER */}
      {activeTab === 'broadcast' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
          {/* Broadcast Composer */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '2rem',
              border: '1px solid #e2e8f0',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#dc2626',
                }}
              >
                <Radio size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark)', margin: 0 }}>
                  Live Platform Broadcast
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '2px 0 0' }}>
                  Pushes real-time alerts instantly to all connected users, riders, and stores.
                </p>
              </div>
            </div>

            {broadcastToast && (
              <div
                style={{
                  backgroundColor: '#ecfdf5',
                  color: '#047857',
                  border: '1px solid #a7f3d0',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <CheckCircle2 size={18} />
                {broadcastToast}
              </div>
            )}

            <form onSubmit={handleBroadcastAlert}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Alert Severity / Category
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'warning', label: '⚠️ Warning', color: '#f59e0b', bg: '#fef3c7' },
                    { id: 'emergency', label: '🚨 Critical', color: '#dc2626', bg: '#fee2e2' },
                    { id: 'info', label: 'ℹ️ Notice', color: '#0284c7', bg: '#e0f2fe' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setBroadcastType(t.id as any)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '10px',
                        border: broadcastType === t.id ? `2px solid ${t.color}` : '1px solid #e2e8f0',
                        backgroundColor: broadcastType === t.id ? t.bg : '#ffffff',
                        color: t.color,
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Headline / Banner Title
                </label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. Monsoon Rain Notice (Rewa Hub)"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    fontWeight: 600,
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Announcement Message
                </label>
                <textarea
                  rows={4}
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  placeholder="Details visible in real-time alert ticker..."
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isBroadcasting}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: broadcastType === 'emergency' ? '#dc2626' : 'var(--primary)',
                  color: broadcastType === 'emergency' ? '#ffffff' : '#064e3b',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: isBroadcasting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                }}
              >
                {isBroadcasting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Broadcasting Live...
                  </>
                ) : (
                  <>
                    <Send size={18} /> Push Live Broadcast Across Platform
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Presets & Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Live Ticker Preview */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '1.75rem',
                border: '1px solid #e2e8f0',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '1rem' }}>
                Live User Banner Preview
              </h4>
              <div
                style={{
                  backgroundColor: broadcastType === 'emergency' ? '#fef2f2' : broadcastType === 'warning' ? '#fffbeb' : '#f0f9ff',
                  border: `1.5px solid ${broadcastType === 'emergency' ? '#fecaca' : broadcastType === 'warning' ? '#fde68a' : '#bae6fd'}`,
                  borderRadius: '14px',
                  padding: '1rem',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ fontSize: '1.3rem', lineHeight: 1 }}>
                  {broadcastType === 'emergency' ? '🚨' : broadcastType === 'warning' ? '⚡' : 'ℹ️'}
                </div>
                <div>
                  <h5
                    style={{
                      margin: '0 0 4px',
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      color: broadcastType === 'emergency' ? '#991b1b' : broadcastType === 'warning' ? '#92400e' : '#0369a1',
                    }}
                  >
                    {broadcastTitle || 'Alert Title'}
                  </h5>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.85rem',
                      color: broadcastType === 'emergency' ? '#7f1d1d' : broadcastType === 'warning' ? '#78350f' : '#075985',
                      lineHeight: 1.45,
                    }}
                  >
                    {broadcastMsg || 'Broadcast message content will appear here.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Ready Dispatch Presets */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '1.75rem',
                border: '1px solid #e2e8f0',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '1rem' }}>
                One-Click Operational Presets
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  {
                    title: '🌧️ Rewa Monsoon Rain Delay Warning',
                    msg: 'Continuous rain across Rewa district. For rider safety, speeds are reduced. Delivery times may extend by 10-15 mins.',
                    type: 'warning' as const,
                  },
                  {
                    title: '🚧 Sirmour Chowk Traffic Rerouting',
                    msg: 'Procession near Sirmour Chowk & College Road. Delivery riders are taking alternate ring roads. All orders are active.',
                    type: 'info' as const,
                  },
                  {
                    title: '🔥 High Evening Demand Peak Alert',
                    msg: 'Surge in dinner and grocery orders! 100% of our rider fleet is mobilized to guarantee delivery under 25 minutes.',
                    type: 'info' as const,
                  },
                  {
                    title: '🛑 Severe Storm Fleet Safety Protocol',
                    msg: 'Extreme storm alert in Rewa. Deliveries are temporarily paused for partner safety and will resume immediately once cleared.',
                    type: 'emergency' as const,
                  },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setBroadcastTitle(preset.title);
                      setBroadcastMsg(preset.msg);
                      setBroadcastType(preset.type);
                    }}
                    style={{
                      textAlign: 'left',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--dark)' }}>{preset.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {preset.msg}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--dark)' }}>
                  Order #{selectedOrder.orderNumber}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Placed on {formatDate(selectedOrder.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            {/* Customer & Address Details */}
            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
              <div><strong>Customer:</strong> {selectedOrder.userName} ({selectedOrder.userPhone})</div>
              <div style={{ marginTop: '4px' }}><strong>Delivery Drop:</strong> {selectedOrder.deliveryAddress}</div>
              <div style={{ marginTop: '4px' }}><strong>Fulfilling Shop:</strong> {selectedOrder.shopName}</div>
              <div style={{ marginTop: '4px' }}><strong>Rider:</strong> {selectedOrder.deliveryPersonnel || 'Sunil Verma'}</div>
            </div>

            {/* Prescription Slip if attached */}
            {selectedOrder.prescriptionImageUrl && (
              <div style={{ marginBottom: '1.25rem', padding: '1rem', border: '1px solid #fed7aa', backgroundColor: '#fff7ed', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#c2410c', display: 'block', marginBottom: '6px' }}>
                  Uploaded Prescription / Order Slip:
                </span>
                <img
                  src={selectedOrder.prescriptionImageUrl}
                  alt="Doctor Prescription"
                  style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #fed7aa' }}
                />
              </div>
            )}

            {/* Live Map Radar for Admin */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                  Live Rider Radar & Delivery Tracking
                </span>
                <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>
                  ● Real-Time GPS Active
                </span>
              </div>
              <LiveRiderMap order={selectedOrder} height="220px" />
            </div>

            {/* Bill Breakdown */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Subtotal / Budget:</span>
                <span>{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Delivery Fee:</span>
                <span>{formatCurrency(selectedOrder.deliveryFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Taxes & GST:</span>
                <span>{formatCurrency(selectedOrder.taxAmount || 0)}</span>
              </div>
              {selectedOrder.charityAmount ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#16a34a' }}>
                  <span>Feeding India Charity:</span>
                  <span>+{formatCurrency(selectedOrder.charityAmount)}</span>
                </div>
              ) : null}
              {selectedOrder.discount ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#dc2626' }}>
                  <span>Discount ({selectedOrder.couponCode}):</span>
                  <span>-{formatCurrency(selectedOrder.discount)}</span>
                </div>
              ) : null}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.05rem', color: 'var(--dark)', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                <span>Grand Total:</span>
                <span>{formatCurrency(selectedOrder.grandTotal)} ({selectedOrder.paymentMethod})</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setInvoiceModalOrder(selectedOrder)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    backgroundColor: '#ecfdf5',
                    color: '#047857',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    border: '1px solid #a7f3d0',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Printer size={15} /> Print Tax Invoice
                </button>

                <button
                  type="button"
                  onClick={() => handleWhatsAppCustomer(selectedOrder)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    border: '1px solid #86efac',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <MessageSquare size={15} /> WhatsApp Customer
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tax Invoice Printable Modal */}
      <AdminInvoiceModal
        order={invoiceModalOrder}
        isOpen={Boolean(invoiceModalOrder)}
        onClose={() => setInvoiceModalOrder(null)}
      />

      {/* Store Partner Onboarding Modal */}
      <AdminAddShopModal
        isOpen={isAddShopOpen}
        onClose={() => setIsAddShopOpen(false)}
        onShopAdded={(newShop: Shop) => setShops((prev) => [newShop, ...prev])}
      />
    </div>
  );
};

