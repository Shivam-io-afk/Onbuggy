import React from 'react';
import { Order } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, X, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface AdminInvoiceModalProps {
  order: Order | null;
  isOpen?: boolean;
  onClose: () => void;
}

export const AdminInvoiceModal: React.FC<AdminInvoiceModalProps> = ({ order, isOpen = true, onClose }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `INV-${order.orderNumber}-${new Date(order.createdAt).getFullYear()}`;
  const cgstAmount = Math.round((order.taxAmount || 0) / 2);
  const sgstAmount = (order.taxAmount || 0) - cgstAmount;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          maxWidth: '750px',
          width: '100%',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Top Control Bar (Non-Printable) */}
        <div
          className="no-print"
          style={{
            padding: '1rem 1.5rem',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
              Official Tax Invoice Preview
            </span>
            <span
              style={{
                backgroundColor: '#ecfdf5',
                color: '#059669',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '9999px',
              }}
            >
              GST Compliant (DPDP & CGST Act)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                backgroundColor: 'var(--primary)',
                color: '#064e3b',
                padding: '7px 14px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.84rem',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Printer size={15} /> Print / Save PDF
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#e2e8f0',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div
          id="onbuggy-invoice-sheet"
          style={{
            padding: '2rem',
            overflowY: 'auto',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            color: '#1e293b',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontWeight: 900,
                    fontSize: '1.2rem',
                    letterSpacing: '0.5px',
                  }}
                >
                  ONBUGGY
                </span>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                  Hyperlocal Logistics Pvt Ltd
                </span>
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>
                Market Yard Complex, Civil Lines, Rewa, MP 486001<br />
                <strong>GSTIN:</strong> 23AABCO1234F1Z8 • <strong>FSSAI:</strong> 11422850000123<br />
                <strong>Support:</strong> support@onbuggy.com | 1800-123-4567
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <h2 style={{ margin: '0 0 4px', fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>
                TAX INVOICE
              </h2>
              <p style={{ margin: '2px 0', fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                Invoice #: {invoiceNumber}
              </p>
              <p style={{ margin: '2px 0', fontSize: '0.78rem', color: '#64748b' }}>
                Order Ref: #{order.orderNumber}
              </p>
              <p style={{ margin: '2px 0', fontSize: '0.78rem', color: '#64748b' }}>
                Date: {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          {/* Billed To / Shipped From */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', fontSize: '0.84rem' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Billed To (Customer):
              </span>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{order.userName}</strong>
              <div style={{ color: '#475569', marginTop: '2px' }}>Phone: {order.userPhone}</div>
              <div style={{ color: '#475569', marginTop: '2px', lineHeight: 1.4 }}>
                Delivery Address: {order.deliveryAddress}
              </div>
              <div style={{ color: '#64748b', marginTop: '2px' }}>Place of Supply: Madhya Pradesh (23)</div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Fulfilling Merchant Partner:
              </span>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{order.shopName}</strong>
              <div style={{ color: '#475569', marginTop: '2px' }}>Category: {order.category || 'Hyperlocal Essentials'}</div>
              <div style={{ color: '#475569', marginTop: '2px' }}>Dispatched Fleet Rider: {order.deliveryPersonnel || 'Sunil Verma'}</div>
              <div style={{ color: '#059669', fontWeight: 600, marginTop: '2px' }}>
                Payment Status: {order.isPaid ? 'PAID & SETTLED' : 'CASH ON DELIVERY'}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', marginBottom: '1.25rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                <th style={{ padding: '8px 10px', width: '30px' }}>#</th>
                <th style={{ padding: '8px 10px' }}>Item Description</th>
                <th style={{ padding: '8px 10px', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Unit Price</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Taxable Amt</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it, idx) => {
                const totalItem = it.price * it.quantity;
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 10px', color: '#64748b' }}>{idx + 1}</td>
                    <td style={{ padding: '8px 10px', fontWeight: 600, color: '#1e293b' }}>
                      {it.name} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({it.unit})</span>
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{it.quantity}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{formatCurrency(it.price)}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700 }}>
                      {formatCurrency(totalItem)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Invoice Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Left QR Stamp & Declaration */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <QRCodeSVG
                value={`https://onbuggy.com/invoice/${order.orderNumber}?verified=true`}
                size={70}
                level="M"
              />
              <div style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.4 }}>
                <strong style={{ color: '#0f172a', display: 'block', marginBottom: '2px' }}>
                  ✓ Digitally Verified Invoice
                </strong>
                This is a computer-generated tax invoice valid under Indian IT Act 2000 & CGST Act 2017. Scan to verify authenticity.
              </div>
            </div>

            {/* Right Math Calculations */}
            <div style={{ fontSize: '0.84rem', lineHeight: 1.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Items Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Delivery & Handling Fee:</span>
                <span>{formatCurrency(order.deliveryFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>CGST (2.5%):</span>
                <span>{formatCurrency(cgstAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>SGST (2.5%):</span>
                <span>{formatCurrency(sgstAmount)}</span>
              </div>
              {order.charityAmount ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                  <span>Feeding India Charity Donation:</span>
                  <span>+{formatCurrency(order.charityAmount)}</span>
                </div>
              ) : null}
              {order.discount ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                  <span>Discount Applied:</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              ) : null}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '2px solid #0f172a',
                  marginTop: '6px',
                  paddingTop: '6px',
                  fontSize: '1.05rem',
                  fontWeight: 900,
                  color: '#0f172a',
                }}
              >
                <span>Grand Total:</span>
                <span>{formatCurrency(order.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div style={{ textAlign: 'center', borderTop: '1px dashed #cbd5e1', paddingTop: '10px', fontSize: '0.75rem', color: '#94a3b8' }}>
            Thank you for choosing Onbuggy Hyperlocal Delivery Rewa! • Helpline: 1800-123-4567 • www.onbuggy.com
          </div>
        </div>
      </div>
    </div>
  );
};
