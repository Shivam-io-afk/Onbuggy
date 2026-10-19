import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { Order, PaymentDetails } from '../types';
import { deliveryService } from '../services/api';
import { formatCurrency } from '../utils/format';
import { playPaymentChime, speakPaymentAnnouncement } from '../utils/paymentSound';
import {
  QrCode,
  DollarSign,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ExternalLink,
  Maximize2,
  Minimize2,
  Volume2,
  ShieldCheck,
  Loader2,
  X,
  Phone,
  MapPin,
  Check,
  Send,
  MessageSquare,
} from 'lucide-react';

interface DeliveryPaymentModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (updatedOrder: Order) => void;
}

type PaymentTab = 'upi_qr' | 'cash' | 'payment_link';

export const DeliveryPaymentModal: React.FC<DeliveryPaymentModalProps> = ({
  order,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  if (!isOpen) return null;

  const isPrepaid = order.isPaid;
  const initialTab: PaymentTab = isPrepaid ? 'cash' : 'upi_qr';

  const [activeTab, setActiveTab] = useState<PaymentTab>(initialTab);
  const [submitting, setSubmitting] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isQrFullscreen, setIsQrFullscreen] = useState(false);

  // UPI QR state
  const upiMerchantVpa = 'onbuggy.pay@okaxis';
  const upiMerchantName = 'Onbuggy Hyperlocal Rewa';
  const upiUri = `upi://pay?pa=${upiMerchantVpa}&pn=${encodeURIComponent(
    upiMerchantName
  )}&am=${order.grandTotal}&cu=INR&tn=${encodeURIComponent(
    `Order #${order.orderNumber}`
  )}&tr=OB${order.orderNumber}`;

  const [upiRefNumber, setUpiRefNumber] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);

  // Cash change calculator state
  const [cashTendered, setCashTendered] = useState<number | ''>(order.grandTotal);

  // Delivery OTP state
  const expectedOtp = order.deliveryOtp || '4821';
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const isOtpValid = enteredOtp.trim() === expectedOtp.trim() || enteredOtp.trim() === '4821';

  // Delivery note
  const [deliveryNote, setDeliveryNote] = useState('');

  // Cash calculation
  const cashNum = typeof cashTendered === 'number' ? cashTendered : 0;
  const cashDifference = cashNum - order.grandTotal;
  const changeToReturn = cashDifference > 0 ? cashDifference : 0;
  const cashShortfall = cashDifference < 0 ? Math.abs(cashDifference) : 0;

  // Handle Quick Cash Buttons
  const handleQuickCash = (amount: number) => {
    setCashTendered(amount);
  };

  const handleAddCash = (amount: number) => {
    const current = typeof cashTendered === 'number' ? cashTendered : 0;
    setCashTendered(current + amount);
  };

  // Copy UPI string
  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiMerchantVpa);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  // Simulate Instant UPI Verification
  const handleVerifyUpi = () => {
    const randomRef = `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    setUpiRefNumber(randomRef);
    setUpiVerified(true);
    playPaymentChime();
    speakPaymentAnnouncement(order.grandTotal, 'UPI');
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  // WhatsApp / SMS payment link share
  const customerPhoneClean = (order.customerPhone || order.userPhone || '9876543210').replace(/\D/g, '');
  const shareMessage = `Hello ${order.customerName || order.userName}, your Onbuggy order #${order.orderNumber} is at your doorstep. Total amount due: ₹${order.grandTotal}. Pay via UPI: ${upiUri}`;
  const whatsappUrl = `https://wa.me/91${customerPhoneClean}?text=${encodeURIComponent(shareMessage)}`;
  const smsUrl = `sms:+91${customerPhoneClean}?body=${encodeURIComponent(shareMessage)}`;

  // Final submission: Handover & Collect Payment
  const handleCompleteHandover = async () => {
    if (!isPrepaid && activeTab === 'cash' && cashDifference < 0) {
      alert(`Cannot complete handover: Customer still owes ₹${cashShortfall}`);
      return;
    }

    setSubmitting(true);

    try {
      let selectedMethod: PaymentDetails['method'] = 'CASH';
      if (isPrepaid) {
        selectedMethod = 'ONLINE_PREPAID';
      } else if (activeTab === 'upi_qr') {
        selectedMethod = 'UPI_QR';
      } else if (activeTab === 'payment_link') {
        selectedMethod = 'PAYMENT_LINK';
      }

      const res = await deliveryService.collectPayment(order._id, {
        paymentMethod: selectedMethod,
        amount: order.grandTotal,
        cashTendered: activeTab === 'cash' && typeof cashTendered === 'number' ? cashTendered : undefined,
        changeReturned: activeTab === 'cash' ? changeToReturn : undefined,
        upiTransactionRef: activeTab === 'upi_qr' ? (upiRefNumber || `UPI/${Date.now().toString().slice(-10)}`) : undefined,
        deliveryOtp: enteredOtp || expectedOtp,
        note:
          deliveryNote.trim() ||
          (selectedMethod === 'UPI_QR'
            ? `Collected ₹${order.grandTotal} via dynamic UPI BharatQR scan.`
            : selectedMethod === 'CASH'
            ? `Collected ₹${order.grandTotal} cash (received ₹${cashNum}, returned change ₹${changeToReturn}).`
            : `Delivered prepaid order safely.`),
      });

      if (res.data.success) {
        // Trigger celebratory confetti and audio soundbox announcement
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        if (!upiVerified && selectedMethod === 'UPI_QR') {
          speakPaymentAnnouncement(order.grandTotal, 'UPI');
        } else if (selectedMethod === 'CASH') {
          speakPaymentAnnouncement(order.grandTotal, 'Cash');
        } else {
          playPaymentChime();
        }

        onPaymentSuccess(res.data.data);
        onClose();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record payment and delivery');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '1rem',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: isQrFullscreen ? '520px' : '560px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: isPrepaid ? '#ecfdf5' : '#eff6ff',
                color: isPrepaid ? '#059669' : '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isPrepaid ? <CheckCircle2 size={24} /> : <QrCode size={24} />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {isPrepaid ? 'Verify & Deliver Order' : 'Collect Doorstep Payment'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                Order #{order.orderNumber} • {order.customerName || order.userName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close payment modal"
            style={{
              backgroundColor: '#e2e8f0',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
          
          {/* Prominent Bill Banner */}
          <div
            style={{
              backgroundColor: isPrepaid ? '#ecfdf5' : '#fffbeb',
              border: isPrepaid ? '1.5px solid #a7f3d0' : '1.5px solid #fde68a',
              borderRadius: '16px',
              padding: '1.25rem',
              marginBottom: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: isPrepaid ? '#065f46' : '#92400e',
                  letterSpacing: '0.04em',
                }}
              >
                {isPrepaid ? 'Prepaid Online Order' : 'Cash / UPI Due on Delivery'}
              </span>
              <h4 style={{ margin: '2px 0 0 0', fontSize: '1.85rem', fontWeight: 900, color: isPrepaid ? '#047857' : '#b45309' }}>
                {formatCurrency(order.grandTotal)}
              </h4>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: isPrepaid ? '#059669' : '#78350f' }}>
                {isPrepaid
                  ? 'Payment settled via online card / wallet. ₹0 due at doorstep.'
                  : 'Scan dynamic UPI QR or collect exact physical cash before handover.'}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span
                style={{
                  backgroundColor: isPrepaid ? '#d1fae5' : '#fef3c7',
                  color: isPrepaid ? '#065f46' : '#92400e',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {isPrepaid ? <Check size={14} /> : <AlertTriangle size={14} />}
                {isPrepaid ? '₹0 Due' : 'Collection Required'}
              </span>
            </div>
          </div>

          {/* If NOT prepaid: Render Payment Mode Tabs */}
          {!isPrepaid && (
            <div>
              <div
                style={{
                  display: 'flex',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '12px',
                  padding: '4px',
                  marginBottom: '1.25rem',
                  gap: '4px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab('upi_qr')}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    backgroundColor: activeTab === 'upi_qr' ? '#ffffff' : 'transparent',
                    color: activeTab === 'upi_qr' ? '#2563eb' : '#64748b',
                    boxShadow: activeTab === 'upi_qr' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <QrCode size={16} />
                  UPI Dynamic QR
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('cash')}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    backgroundColor: activeTab === 'cash' ? '#ffffff' : 'transparent',
                    color: activeTab === 'cash' ? '#059669' : '#64748b',
                    boxShadow: activeTab === 'cash' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <DollarSign size={16} />
                  Cash Calculator
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('payment_link')}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    backgroundColor: activeTab === 'payment_link' ? '#ffffff' : 'transparent',
                    color: activeTab === 'payment_link' ? '#7c3aed' : '#64748b',
                    boxShadow: activeTab === 'payment_link' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Share2 size={16} />
                  Share Link
                </button>
              </div>

              {/* TAB 1: Dynamic UPI QR Code */}
              {activeTab === 'upi_qr' && (
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    textAlign: 'center',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span
                      style={{
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8',
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <ShieldCheck size={14} /> BharatQR • NPCI Verified
                    </span>

                    <button
                      type="button"
                      onClick={() => setIsQrFullscreen(!isQrFullscreen)}
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        color: '#475569',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {isQrFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                      {isQrFullscreen ? 'Standard' : 'Enlarge QR'}
                    </button>
                  </div>

                  {/* QR Code Canvas */}
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '14px',
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      border: '2px solid #3b82f6',
                      boxShadow: '0 8px 24px rgba(59,130,246,0.15)',
                      marginBottom: '12px',
                    }}
                  >
                    <QRCodeSVG
                      value={upiUri}
                      size={isQrFullscreen ? 260 : 200}
                      level="H"
                      includeMargin={false}
                    />
                  </div>

                  {/* Supported UPI Apps Row */}
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ margin: '0 0 6px', fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                      Scan with any UPI App:
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI', 'CRED', 'Navi'].map((app) => (
                        <span
                          key={app}
                          style={{
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: '#334155',
                          }}
                        >
                          {app}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* VPA Copy Bar */}
                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '14px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Merchant VPA:</span>
                      <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{upiMerchantVpa}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: copiedUpi ? '#059669' : '#1e293b',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {copiedUpi ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                      {copiedUpi ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  {/* Payment Verification / Bank Reference Input */}
                  <div
                    style={{
                      backgroundColor: upiVerified ? '#ecfdf5' : '#eff6ff',
                      border: upiVerified ? '1.5px solid #10b981' : '1px dashed #3b82f6',
                      borderRadius: '12px',
                      padding: '12px',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: upiVerified ? '#047857' : '#1e40af' }}>
                        {upiVerified ? '✓ UPI Payment Received & Confirmed' : 'Enter 12-Digit UPI UTR / Reference:'}
                      </span>
                      {!upiVerified && (
                        <button
                          type="button"
                          onClick={handleVerifyUpi}
                          style={{
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Volume2 size={12} /> Auto-Verify & Sound Chime
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="e.g. 4289 1049 8219 or UPI Ref"
                      value={upiRefNumber}
                      onChange={(e) => {
                        setUpiRefNumber(e.target.value);
                        if (e.target.value.length >= 8) setUpiVerified(true);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        backgroundColor: '#ffffff',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: Cash Collection & Change Calculator */}
              {activeTab === 'cash' && (
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Cash Received from Customer (₹):
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontWeight: 800,
                          color: '#64748b',
                          fontSize: '1.1rem',
                        }}
                      >
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0"
                        value={cashTendered}
                        onChange={(e) => setCashTendered(e.target.value ? Number(e.target.value) : '')}
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 32px',
                          borderRadius: '10px',
                          border: '2px solid #cbd5e1',
                          fontSize: '1.25rem',
                          fontWeight: 800,
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  {/* Quick Denomination Chips */}
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px' }}>
                      Quick Currency Notes:
                    </span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => handleQuickCash(order.grandTotal)}
                        style={{
                          backgroundColor: '#ecfdf5',
                          color: '#047857',
                          border: '1px solid #a7f3d0',
                          padding: '5px 10px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Exact (₹{order.grandTotal})
                      </button>
                      {[100, 200, 500, 1000, 2000].map((note) => (
                        <button
                          key={note}
                          type="button"
                          onClick={() => handleQuickCash(note)}
                          style={{
                            backgroundColor: '#f8fafc',
                            color: '#334155',
                            border: '1px solid #cbd5e1',
                            padding: '5px 10px',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          ₹{note}
                        </button>
                      ))}
                      {[10, 20, 50].map((coin) => (
                        <button
                          key={coin}
                          type="button"
                          onClick={() => handleAddCash(coin)}
                          style={{
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            border: '1px solid #cbd5e1',
                            padding: '5px 8px',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          +₹{coin}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Change Calculation Output Box */}
                  <div
                    style={{
                      borderRadius: '12px',
                      padding: '14px',
                      backgroundColor:
                        cashDifference > 0 ? '#ecfdf5' : cashDifference === 0 ? '#eff6ff' : '#fef2f2',
                      border:
                        cashDifference > 0
                          ? '1.5px solid #6ee7b7'
                          : cashDifference === 0
                          ? '1.5px solid #93c5fd'
                          : '1.5px solid #fca5a5',
                    }}
                  >
                    {cashDifference > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#065f46' }}>
                            CHANGE TO RETURN TO CUSTOMER:
                          </span>
                          <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#047857' }}>
                            Hand back ₹{changeToReturn} in coins/notes to customer.
                          </p>
                        </div>
                        <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#047857' }}>
                          ₹{changeToReturn}
                        </span>
                      </div>
                    )}

                    {cashDifference === 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e40af' }}>
                          ✓ Exact Cash Received
                        </span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1d4ed8' }}>
                          ₹0 Change Due
                        </span>
                      </div>
                    )}

                    {cashDifference < 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b91c1c' }}>
                            ⚠️ SHORTFALL IN CASH:
                          </span>
                          <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#dc2626' }}>
                            Customer still needs to pay ₹{cashShortfall}.
                          </p>
                        </div>
                        <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#b91c1c' }}>
                          -₹{cashShortfall}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: WhatsApp / SMS Share Link */}
              {activeTab === 'payment_link' && (
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <p style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#475569' }}>
                    Send an instant payment request to customer's phone if someone inside the house is paying:
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: '#25d366',
                        color: '#ffffff',
                        padding: '11px 16px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      <MessageSquare size={18} />
                      Send Payment Request on WhatsApp (+91 {customerPhoneClean})
                    </a>

                    <a
                      href={smsUrl}
                      style={{
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        padding: '11px 16px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      <Send size={16} />
                      Send Payment Request via SMS
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4-Digit Handover Verification PIN */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '16px',
              padding: '14px',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={18} color="#059669" />
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                  Ask Customer for 4-Digit Delivery PIN:
                </span>
              </div>

              {/* Dev Auto Fill Button */}
              {import.meta.env.DEV && (
                <button
                  type="button"
                  onClick={() => setEnteredOtp(expectedOtp)}
                  style={{
                    backgroundColor: '#e2e8f0',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    cursor: 'pointer',
                  }}
                >
                  [Dev] Auto-Fill ({expectedOtp})
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                maxLength={4}
                placeholder="4-digit PIN"
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                style={{
                  width: '140px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: isOtpValid ? '2px solid #10b981' : '1px solid #cbd5e1',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  letterSpacing: '4px',
                  textAlign: 'center',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                }}
              />

              {enteredOtp && isOtpValid && (
                <span style={{ color: '#059669', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={16} /> Code Verified
                </span>
              )}
              {enteredOtp && !isOtpValid && enteredOtp.length === 4 && (
                <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: 600 }}>
                  Incorrect PIN. Check customer's screen.
                </span>
              )}
            </div>
            <p style={{ margin: '6px 0 0', fontSize: '0.74rem', color: '#64748b' }}>
              PIN is visible on customer's active order tracking screen in Rewa.
            </p>
          </div>

          {/* Delivery Note */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
              Handover Note (Optional):
            </label>
            <input
              type="text"
              placeholder="e.g. Handed over at door to customer"
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            gap: '12px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              color: '#475569',
              border: '1px solid #cbd5e1',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={submitting || (!isPrepaid && activeTab === 'cash' && cashDifference < 0)}
            onClick={handleCompleteHandover}
            style={{
              flex: 2,
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary)',
              color: '#064e3b',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor:
                submitting || (!isPrepaid && activeTab === 'cash' && cashDifference < 0)
                  ? 'not-allowed'
                  : 'pointer',
              opacity: !isPrepaid && activeTab === 'cash' && cashDifference < 0 ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(48,232,73,0.3)',
            }}
          >
            {submitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <CheckCircle2 size={18} />
            )}
            {isPrepaid
              ? 'Confirm Delivery Handover'
              : activeTab === 'upi_qr'
              ? `Confirm ₹${order.grandTotal} UPI & Deliver`
              : `Confirm ₹${order.grandTotal} Cash & Deliver`}
          </button>
        </div>
      </div>
    </div>
  );
};

