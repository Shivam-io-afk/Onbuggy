import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/api';
import { Order } from '../types';
import { joinOrderRoom, leaveOrderRoom, subscribeToOrderUpdates, subscribeToLocationUpdates } from '../services/socket';
import { OrderTracker } from '../components/OrderTracker';
import { LiveRiderMap } from '../components/LiveRiderMap';
import { formatCurrency, formatDate } from '../utils/format';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  ShoppingBag,
  ArrowRight,
  RotateCw,
  MapPin,
  Calendar,
  Clock,
  Truck,
  Store,
  Navigation,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

export const MyOrdersPage: React.FC = () => {
  useDocumentTitle('My Orders & Live Tracking', 'Track your live Onbuggy deliveries and order history in Rewa.');

  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [mapFailed, setMapFailed] = useState<boolean>(false);

  // Protected route guard: Redirect to signin if unauthenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/signin?redirect=/my-orders', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const fetchOrders = async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await orderService.getMyOrders({
        email: user?.email,
        phone: user?.phone,
      });
      if (res.data.success) {
        const fetchedOrders: Order[] = res.data.data;
        setOrders(fetchedOrders);
        setLastRefreshed(new Date());

        if (fetchedOrders.length > 0) {
          // If we had a selected order, re-select updated version, else select first active or first order
          setSelectedOrder((prevSelected) => {
            if (prevSelected) {
              const matched = fetchedOrders.find((o) => o._id === prevSelected._id);
              if (matched) return matched;
            }
            const active = fetchedOrders.find((o) => o.status !== 'Delivered' && o.status !== 'Cancelled');
            return active || fetchedOrders[0];
          });
        } else {
          setSelectedOrder(null);
        }
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [user, isAuthenticated]);

  // Live polling for in-transit orders
  useEffect(() => {
    if (!isAuthenticated || !selectedOrder) return;
    if (selectedOrder.status !== 'Processing' && selectedOrder.status !== 'Out for Delivery') return;

    const interval = setInterval(() => {
      fetchOrders(true);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAuthenticated, selectedOrder?.status, selectedOrder?._id]);

  // Real-time WebSocket room & event subscriptions
  useEffect(() => {
    if (!selectedOrder?._id) return;

    joinOrderRoom(selectedOrder._id);

    const unsubOrder = subscribeToOrderUpdates(({ order: updatedOrder }) => {
      if (updatedOrder._id === selectedOrder._id) {
        setSelectedOrder(updatedOrder);
        setOrders((prev) => prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o)));
      }
    });

    const unsubLoc = subscribeToLocationUpdates(({ orderId, deliveryLocation }) => {
      if (orderId === selectedOrder._id) {
        setSelectedOrder((prev) => (prev ? { ...prev, deliveryLocation } : prev));
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, deliveryLocation } : o))
        );
      }
    });

    return () => {
      leaveOrderRoom(selectedOrder._id);
      unsubOrder();
      unsubLoc();
    };
  }, [selectedOrder?._id]);

  const handleOrderUpdated = (updatedOrder: Order) => {
    setSelectedOrder(updatedOrder);
    setOrders((prev) => prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o)));
  };

  if (authLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem', color: '#64748b' }}>
        <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem auto', color: 'var(--primary-hover)' }} />
        <p style={{ fontWeight: 600 }}>Checking session credentials...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem 5rem 1.5rem' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--dark)', fontFamily: 'var(--font-brand)' }}>
            My Orders & Tracking
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Real-time delivery progress updates and full order history for {user?.name || 'your account'}.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Updated: {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <button
            onClick={() => fetchOrders(true)}
            disabled={isRefreshing}
            style={{
              backgroundColor: '#f1f5f9',
              color: '#334155',
              padding: '9px 16px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid #e2e8f0',
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
            }}
          >
            <RotateCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: '#64748b' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px auto', color: 'var(--primary-hover)' }} />
          <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '5rem 2rem',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}
          >
            <ShoppingBag size={28} color="var(--primary-hover)" />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '8px' }}>
            No orders placed yet
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem', maxWidth: '440px', margin: '0 auto 1.5rem auto' }}>
            Browse local medical stores, supermarkets, and vegetable vendors in Rewa to place your first quick delivery order.
          </p>
          <Link
            to="/order-gothru"
            style={{
              backgroundColor: 'var(--primary)',
              color: '#064e3b',
              fontWeight: 800,
              padding: '12px 24px',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            Order Now <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
          {/* Left Column: Live Tracker of Selected Order */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {selectedOrder ? (
              <OrderTracker order={selectedOrder} onOrderUpdated={handleOrderUpdated} />
            ) : (
              <div
                style={{
                  padding: '2rem',
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center',
                  color: '#64748b',
                }}
              >
                Select an order from the right to track its live delivery status.
              </div>
            )}

            {/* Real-time Interactive Leaflet Map with Custom Markers & Live Transit */}
            {selectedOrder && (
              <LiveRiderMap order={selectedOrder} onOrderUpdated={handleOrderUpdated} />
            )}
          </div>

          {/* Right Column: Order History Cards */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--dark)' }}>
                Order History ({orders.length})
              </h3>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Recent Orders</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {orders.map((o) => {
                const isSelected = selectedOrder?._id === o._id;
                const isDelivered = o.status === 'Delivered';
                return (
                  <div
                    key={o._id}
                    onClick={() => setSelectedOrder(o)}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      padding: '1.25rem',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                      boxShadow: isSelected ? '0 8px 25px rgba(48, 232, 73, 0.15)' : 'var(--shadow-sm)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <h4 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--dark)' }}>
                          {o.shopName}
                        </h4>
                        <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                          Order #<strong>{o.orderNumber}</strong> •{' '}
                          {isDelivered
                            ? `Delivered by ${o.deliveryPersonnel || 'Sunil Verma'}`
                            : `Rider: ${o.deliveryPersonnel || 'Sunil Verma'}`}
                        </p>
                      </div>
                      <span
                        style={{
                          backgroundColor:
                            o.status === 'Delivered'
                              ? '#dcfce7'
                              : o.status === 'Cancelled'
                              ? '#fee2e2'
                              : '#e0f2fe',
                          color:
                            o.status === 'Delivered'
                              ? '#15803d'
                              : o.status === 'Cancelled'
                              ? '#b91c1c'
                              : '#0369a1',
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                        }}
                      >
                        {o.status}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '12px',
                        paddingTop: '10px',
                        borderTop: '1px solid #f8fafc',
                        fontSize: '0.85rem',
                      }}
                    >
                      <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={13} />
                        <span style={{ fontSize: '0.82rem' }}>{formatDate(o.createdAt)}</span>
                      </div>
                      <div style={{ fontWeight: 800, color: 'var(--dark)', fontSize: '1.05rem' }}>
                        {formatCurrency(o.grandTotal)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <Link
                        to={`/order-gothru?shopId=${o.shopId || ''}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          padding: '6px 14px',
                          backgroundColor: '#ecfdf5',
                          color: '#065f46',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                        }}
                      >
                        Buy Again
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(o);
                        }}
                        style={{
                          padding: '6px 14px',
                          backgroundColor: isSelected ? 'var(--dark)' : '#f1f5f9',
                          color: isSelected ? 'var(--primary)' : '#475569',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {isSelected ? 'Currently Tracking' : 'Track This'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


