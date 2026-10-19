import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { orderService } from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import { CheckCircle2, AlertTriangle, ArrowRight, XCircle, Truck, Package, Clock, ShieldCheck, Loader2 } from 'lucide-react';

interface OrderTrackerProps {
  order: Order;
  onOrderUpdated: (updatedOrder: Order) => void;
}

const STAGES: { status: OrderStatus; label: string; icon: string; desc: string }[] = [
  {
    status: 'Order Placed',
    label: 'Order Placed',
    icon: '/resorces/other/order-assets/order-placed.png',
    desc: 'Order received and confirmed with store partner.',
  },
  {
    status: 'Processing',
    label: 'Processing',
    icon: '/resorces/other/order-assets/processing.png',
    desc: 'Store staff is assembling, packing and checking items.',
  },
  {
    status: 'Out for Delivery',
    label: 'Out for Delivery',
    icon: '/resorces/other/order-assets/out-for.png',
    desc: 'Rider is on the way to your delivery location.',
  },
  {
    status: 'Delivered',
    label: 'Delivered',
    icon: '/resorces/other/order-assets/order-delivered.png',
    desc: 'Order handed over safely at your doorstep.',
  },
];

export const OrderTracker: React.FC<OrderTrackerProps> = ({ order, onOrderUpdated }) => {
  const [isAdvancing, setIsAdvancing] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  const currentStageIndex = STAGES.findIndex((s) => s.status === order.status);
  const isCancelled = order.status === 'Cancelled';
  const isDelivered = order.status === 'Delivered';
  const isOutForDelivery = order.status === 'Out for Delivery';
  // Cancel is only allowed BEFORE order goes out for delivery
  const canCancel = !isCancelled && !isDelivered && !isOutForDelivery;

  const handleAdvanceStatus = async () => {
    setIsAdvancing(true);
    try {
      const res = await orderService.advanceOrderStatus(order._id);
      if (res.data.success) {
        onOrderUpdated(res.data.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not advance status');
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleCancelOrder = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel Order #${order.orderNumber}? Once cancelled, the order cannot be restored.`
    );
    if (!confirmed) return;

    setIsCancelling(true);
    try {
      const res = await orderService.cancelOrder(order._id);
      if (res.data.success) {
        onOrderUpdated(res.data.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0',
      }}
    >
      {/* Header Info */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '1.25rem',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--dark)' }}>
              Order #{order.orderNumber}
            </span>
            <span
              style={{
                backgroundColor: isCancelled
                  ? '#fee2e2'
                  : isDelivered
                  ? '#dcfce7'
                  : '#e0f2fe',
                color: isCancelled ? '#b91c1c' : isDelivered ? '#15803d' : '#0369a1',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              {order.status}
            </span>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '4px' }}>
            From <strong>{order.shopName}</strong> • Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
            {isDelivered ? 'Delivered by:' : 'Assigned Rider:'}
          </p>
          <p
            style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: 'var(--dark)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              justifyContent: 'flex-end',
            }}
          >
            <Truck size={16} color="var(--primary-hover)" />
            {order.deliveryPersonnel || 'Sunil Verma'}
          </p>
        </div>
      </div>

      {/* Cancelled Banner */}
      {isCancelled && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#991b1b',
            marginBottom: '1.5rem',
          }}
        >
          <XCircle size={24} />
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Order Cancelled</h4>
            <p style={{ fontSize: '0.85rem', color: '#b91c1c' }}>
              This order was cancelled and will not be delivered. If charged, your refund has been initiated.
            </p>
          </div>
        </div>
      )}

      {/* Vertical 4-Stage Progress Track */}
      {!isCancelled && (
        <div style={{ position: 'relative', paddingLeft: '32px', marginBottom: '2rem' }}>
          {STAGES.map((stage, index) => {
            const isCompleted = index <= currentStageIndex;
            const isCurrent = index === currentStageIndex;

            return (
              <div
                key={stage.status}
                style={{
                  position: 'relative',
                  paddingBottom: index === STAGES.length - 1 ? '0' : '2.2rem',
                }}
              >
                {/* Connecting Line */}
                {index < STAGES.length - 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '-23px',
                      top: '20px',
                      bottom: '0',
                      width: '4px',
                      backgroundColor: index < currentStageIndex ? 'var(--primary)' : '#e2e8f0',
                      transition: 'background-color 0.4s ease',
                    }}
                  />
                )}

                {/* Node Indicator Dot */}
                <div
                  className={isCurrent ? 'animate-pulse-glow' : ''}
                  style={{
                    position: 'absolute',
                    left: '-32px',
                    top: '2px',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: isCompleted ? 'var(--dark)' : '#cbd5e1',
                    border: isCompleted ? '3px solid var(--primary)' : '3px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isCompleted && (
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary)',
                      }}
                    />
                  )}
                </div>

                {/* Content Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h4
                      style={{
                        fontSize: '1.02rem',
                        fontWeight: isCurrent ? 800 : isCompleted ? 700 : 500,
                        color: isCompleted ? 'var(--dark)' : '#94a3b8',
                      }}
                    >
                      {stage.label}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: isCompleted ? '#475569' : '#94a3b8', marginTop: '2px' }}>
                      {stage.desc}
                    </p>
                  </div>
                  <img
                    src={stage.icon}
                    alt={stage.label}
                    style={{
                      width: '38px',
                      height: '38px',
                      objectFit: 'contain',
                      filter: isCompleted ? 'none' : 'grayscale(100%) opacity(40%)',
                      transition: 'filter 0.3s',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Simulator Actions & Cancel */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          borderTop: '1px solid #f1f5f9',
          paddingTop: '1.25rem',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Grand Total:{' '}
          <strong style={{ color: 'var(--dark)', fontSize: '1.15rem' }}>
            {formatCurrency(order.grandTotal)}
          </strong>{' '}
          ({order.paymentMethod})
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Simulate Next Stage is restricted to DEV environment */}
          {import.meta.env.DEV && !isCancelled && !isDelivered && (
            <button
              onClick={handleAdvanceStatus}
              disabled={isAdvancing}
              title="Dev simulation tool to test state transitions"
              style={{
                backgroundColor: 'var(--dark)',
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                padding: '8px 14px',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                border: '1px dashed var(--primary)',
                cursor: isAdvancing ? 'not-allowed' : 'pointer',
              }}
            >
              {isAdvancing ? <Loader2 size={14} className="animate-spin" /> : null}
              [Dev] Next Stage <ArrowRight size={14} />
            </button>
          )}

          {/* Cancel Order: strictly allowed only before Out for Delivery and Delivered */}
          {canCancel && (
            <button
              onClick={handleCancelOrder}
              disabled={isCancelling}
              style={{
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                fontWeight: 600,
                fontSize: '0.82rem',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #fecaca',
                cursor: isCancelling ? 'not-allowed' : 'pointer',
              }}
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

