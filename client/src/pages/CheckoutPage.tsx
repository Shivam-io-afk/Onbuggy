import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { shopService, orderService } from '../services/api';
import { Shop } from '../types';
import { siteConfig, calculateBill } from '../config/site';
import { formatCurrency } from '../utils/format';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import confetti from 'canvas-confetti';
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  MapPin,
  Tag,
  CreditCard,
  Wallet,
  Banknote,
  Check,
  ArrowRight,
  ShieldAlert,
  Trash2,
  Info,
  Clock,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  useDocumentTitle('Checkout & Instant Order', 'Upload prescription or order slip for instant 20-min delivery.');
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  // File Upload State
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const [fileError, setFileError] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);

  // Form Fields - Prefill ONLY from authenticated user, no hardcoded defaults!
  const [recipientName, setRecipientName] = useState<string>(user?.name || '');
  const [recipientPhone, setRecipientPhone] = useState<string>(user?.phone || '');
  const [address, setAddress] = useState<string>(
    user?.address?.street ? `${user.address.street}, ${user.address.city || siteConfig.serviceableCity} ${user.address.pincode || ''}`.trim() : ''
  );

  // Validation States
  const [phoneError, setPhoneError] = useState<string>('');
  const [addressError, setAddressError] = useState<string>('');
  const [prescriptionError, setPrescriptionError] = useState<string>('');

  // Billing State
  const [budgetInput, setBudgetInput] = useState<string>('350');
  const [budgetError, setBudgetError] = useState<string>('');
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<string>('');
  const [optInCharity, setOptInCharity] = useState<boolean>(false);

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'Debit Card' | 'Credit Card' | 'Wallet' | 'Pay-on-Delivery (COD)'>('Pay-on-Delivery (COD)');
  const [submittingOrder, setSubmittingOrder] = useState<boolean>(false);

  // Parse budget integer
  const numericBudget = useMemo(() => {
    const parsed = parseInt(budgetInput, 10);
    return isNaN(parsed) ? 0 : parsed;
  }, [budgetInput]);

  // Compute live bill using single source of truth
  const bill = useMemo(() => {
    return calculateBill(numericBudget, appliedCoupon, optInCharity);
  }, [numericBudget, appliedCoupon, optInCharity]);

  // Update recipient when user changes/logs in
  useEffect(() => {
    if (user) {
      if (!recipientName) setRecipientName(user.name || '');
      if (!recipientPhone) setRecipientPhone(user.phone || '');
      if (!address && user.address?.street) {
        setAddress(`${user.address.street}, ${user.address.city || siteConfig.serviceableCity} ${user.address.pincode || ''}`.trim());
      }
    }
  }, [user]);

  // Fetch shops & preselect by shopId or category
  useEffect(() => {
    shopService.getShops().then((res) => {
      if (res.data.success && res.data.data.length > 0) {
        const allShops = res.data.data;
        setShops(allShops);

        const shopIdParam = searchParams.get('shopId');
        const categoryParam = searchParams.get('category');

        if (shopIdParam) {
          const match = allShops.find((s) => s._id === shopIdParam && s.isOpen);
          if (match) {
            setSelectedShop(match);
            return;
          }
        }

        if (categoryParam) {
          const matchCategory = allShops.find((s) => s.category === categoryParam && s.isOpen);
          if (matchCategory) {
            setSelectedShop(matchCategory);
            return;
          }
        }

        // Default to first open store
        const firstOpen = allShops.find((s) => s.isOpen) || allShops[0];
        setSelectedShop(firstOpen);
      }
    });
  }, [searchParams]);

  // Validate budget input
  const handleBudgetChange = (value: string) => {
    // Only allow whole positive numbers
    const clean = value.replace(/[^0-9]/g, '');
    setBudgetInput(clean);

    const val = parseInt(clean, 10);
    if (!clean || isNaN(val)) {
      setBudgetError('Please enter an approximate budget amount.');
    } else if (val < siteConfig.minOrderBudget) {
      setBudgetError(`Minimum order budget is ${formatCurrency(siteConfig.minOrderBudget)}.`);
    } else if (val > siteConfig.maxOrderBudget) {
      setBudgetError(`Maximum order budget is ${formatCurrency(siteConfig.maxOrderBudget)}.`);
    } else {
      setBudgetError('');
    }
  };

  // File change handler with strict validation
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    setPrescriptionError('');
    if (!e.target.files || e.target.files.length === 0) return;

    const selected = e.target.files[0];
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowed.includes(selected.type)) {
      setFileError('Invalid file type! Please select a PNG, JPG, or WEBP image.');
      return;
    }

    if (selected.size > 1.5 * 1024 * 1024) {
      setFileError('File size exceeds 1.5 MB limit. Please choose a smaller image.');
      return;
    }

    setFile(selected);
    const objectUrl = URL.createObjectURL(selected);
    setFilePreview(objectUrl);

    // Upload to server
    setUploading(true);
    try {
      const res = await orderService.uploadPrescription(selected);
      if (res.data.success) {
        setUploadedUrl(res.data.imageUrl);
      }
    } catch {
      // In local fallback mode
      setUploadedUrl(objectUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFilePreview('');
    setUploadedUrl('');
    setFileError('');
  };

  // Coupon handling
  const handleApplyCoupon = (code: string) => {
    const formatted = code.trim().toUpperCase();
    if (!formatted) return;

    const matched = siteConfig.coupons.find((c) => c.code === formatted);
    if (!matched) {
      alert(`Invalid coupon code "${formatted}".`);
      return;
    }

    if (numericBudget < matched.minOrderValue) {
      alert(`Coupon "${formatted}" requires a minimum budget of ${formatCurrency(matched.minOrderValue)}.`);
      return;
    }

    setAppliedCoupon(formatted);
    setCouponCode(formatted);
  };

  const handleClearCoupon = () => {
    setCouponCode('');
    setAppliedCoupon('');
  };

  // Form submission
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');
    setAddressError('');
    setPrescriptionError('');

    // Phone validation (10-digit Indian mobile starting with 6-9)
    const phoneClean = recipientPhone.replace(/[\s-]/g, '');
    const phonePattern = /^[6-9]\d{9}$/;
    if (!phonePattern.test(phoneClean)) {
      setPhoneError('Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).');
      return;
    }

    // Address validation (must have at least house/street and 6-digit pin)
    if (address.trim().length < 10) {
      setAddressError('Please provide complete delivery address with flat/house number and landmark (min 10 characters).');
      return;
    }

    // Prescription validation for medicine stores
    if (selectedShop?.category === 'medicine' && !file && !uploadedUrl) {
      setPrescriptionError('Prescription / doctor slip upload is required for pharmacy orders under Indian Drug regulations.');
      return;
    }

    // Budget validation
    if (numericBudget < siteConfig.minOrderBudget || numericBudget > siteConfig.maxOrderBudget) {
      setBudgetError(`Order budget must be between ${formatCurrency(siteConfig.minOrderBudget)} and ${formatCurrency(siteConfig.maxOrderBudget)}.`);
      return;
    }

    setSubmittingOrder(true);
    try {
      const payload = {
        shopId: selectedShop?._id,
        shopName: selectedShop?.name || 'Local Store',
        deliveryAddress: address.trim(),
        prescriptionImageUrl: uploadedUrl,
        subtotal: numericBudget,
        couponCode: appliedCoupon,
        optInCharity,
        paymentMethod,
        userName: recipientName.trim() || (user?.name || 'Customer'),
        userPhone: phoneClean,
        items: [
          {
            name: file ? `Prescription/Slip Order (${file.name})` : `${selectedShop?.categoryLabel || 'Store'} Order Bundle`,
            price: numericBudget,
            quantity: 1,
            unit: 'package',
          },
        ],
      };

      const res = await orderService.createOrder(payload);
      if (res.data.success) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });

        setTimeout(() => {
          navigate('/my-orders');
        }, 1200);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const isPharmacy = selectedShop?.category === 'medicine';

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem 5rem 1.5rem' }}>
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--dark)', fontFamily: 'var(--font-brand)' }}>
          Checkout & Instant Order
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '4px' }}>
          Delivery in {siteConfig.deliveryTimeText} to your doorstep in {siteConfig.serviceableCity}.
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem', alignItems: 'start' }}>
        {/* Left Column: Store Selection, Prescription & Address */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* 1. Store Selector */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
            <label htmlFor="shop-select" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
              1. Selecting Store ({siteConfig.serviceableCity}):
            </label>
            <select
              id="shop-select"
              value={selectedShop?._id || ''}
              onChange={(e) => {
                const found = shops.find((s) => s._id === e.target.value);
                if (found && found.isOpen) setSelectedShop(found);
              }}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--dark)',
                outline: 'none',
                backgroundColor: '#ffffff',
              }}
            >
              {shops.map((s) => (
                <option key={s._id} value={s._id} disabled={!s.isOpen}>
                  {s.name} ({s.category.toUpperCase()} • {s.rating} ★ • {s.deliveryTimeMin} min delivery){!s.isOpen ? ' — Closed, opens 6:00 PM' : ''}
                </option>
              ))}
            </select>

            {selectedShop && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', fontSize: '0.85rem', color: '#64748b' }}>
                <span style={{ color: 'var(--primary-hover)', fontWeight: 600 }}>{selectedShop.categoryLabel}</span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} /> {selectedShop.deliveryTimeMin} mins
                </span>
                <span>•</span>
                <span>{selectedShop.distanceKm} km away</span>
              </div>
            )}
          </div>

          {/* 2. Upload Prescription / Slip */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UploadCloud size={20} color="var(--primary-hover)" />
                2. Upload Order Slip / Doctor's Prescription
                {isPharmacy && <span style={{ color: '#dc2626', fontSize: '0.9rem' }}>*</span>}
              </h2>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
              {isPharmacy
                ? 'Doctor prescription is required for Schedule H/X drugs under Indian drug regulations. Upload a clear photo of your prescription or item list.'
                : 'Upload handwritten grocery list or vegetable item memo (PNG, JPG, WEBP < 1.5MB).'}
            </p>

            {isPharmacy && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={18} style={{ flexShrink: 0 }} />
                <span><strong>Schedule H/X Drug Compliance:</strong> Our licensed partner pharmacists verify all uploaded prescriptions before dispatch.</span>
              </div>
            )}

            {fileError && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={16} /> {fileError}
              </div>
            )}

            {prescriptionError && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={16} /> {prescriptionError}
              </div>
            )}

            {file ? (
              <div style={{ border: '2px solid #a7f3d0', borderRadius: '14px', backgroundColor: '#f0fdf4', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {filePreview && (
                    <img
                      src={filePreview}
                      alt="Prescription preview"
                      style={{ height: '70px', width: '70px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  )}
                  <div>
                    <p style={{ fontWeight: 700, color: '#065f46', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileCheck size={18} /> {file.name}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: '#047857' }}>
                      {(file.size / 1024).toFixed(1)} KB • {uploading ? 'Uploading...' : 'Uploaded ready'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  title="Remove image"
                  style={{
                    backgroundColor: '#fee2e2',
                    color: '#b91c1c',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                  }}
                >
                  <Trash2 size={15} /> Remove
                </button>
              </div>
            ) : (
              <label
                htmlFor="slip-file"
                style={{
                  border: '2px dashed var(--primary)',
                  borderRadius: '14px',
                  backgroundColor: '#f0fdf4',
                  padding: '2rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <input
                  id="slip-file"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <UploadCloud size={40} color="var(--primary-hover)" style={{ marginBottom: '8px' }} />
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--dark)' }}>
                  Click to Browse or Drag Slip Photo Here
                </span>
                <span style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
                  Supported formats: PNG, JPG, WEBP (Max 1.5MB)
                </span>
              </label>
            )}
          </div>

          {/* 3. Delivery Address & Recipient */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} color="var(--primary-hover)" />
              3. Delivery Address & Recipient Contact
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label htmlFor="recipient-name" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Recipient Full Name *
                  </label>
                  <input
                    id="recipient-name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="e.g. Ramesh Kumar"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label htmlFor="recipient-phone" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    10-Digit Mobile Number *
                  </label>
                  <input
                    id="recipient-phone"
                    type="tel"
                    inputMode="numeric"
                    pattern="[6-9][0-9]{9}"
                    maxLength={10}
                    required
                    autoComplete="tel-national"
                    placeholder="e.g. 9826112233"
                    value={recipientPhone}
                    onChange={(e) => {
                      setRecipientPhone(e.target.value.replace(/[^0-9]/g, ''));
                      setPhoneError('');
                    }}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: phoneError ? '2px solid #ef4444' : '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
                  />
                  {phoneError && <p style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '4px' }}>{phoneError}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="delivery-address" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Street / Flat / Landmark & 6-Digit Pincode *
                </label>
                <textarea
                  id="delivery-address"
                  required
                  rows={3}
                  autoComplete="street-address"
                  placeholder="e.g. Flat 302, Green Heights, Near Civil Lines Post Office, Rewa 486001"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setAddressError('');
                  }}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: addressError ? '2px solid #ef4444' : '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', resize: 'vertical' }}
                />
                {addressError && <p style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '4px' }}>{addressError}</p>}
              </div>

              {!isAuthenticated && (
                <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#64748b' }}>
                  Ordering as guest? <Link to="/signin?redirect=/order-gothru" style={{ color: 'var(--primary-hover)', fontWeight: 700 }}>Sign in</Link> to save addresses and track orders on all devices.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Billing Breakdown & Payment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* 4. Billing Breakdown */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '1.25rem' }}>
              4. Bill Breakdown
            </h2>

            {/* Approximate Budget Input */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label htmlFor="budget-input" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                  Approx. budget (final bill confirmed by store) *
                </label>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '6px' }}>
                Store will confirm exact item pricing upon prescription verification.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', fontSize: '1.1rem', fontWeight: 700, color: '#64748b' }}>₹</span>
                <input
                  id="budget-input"
                  type="text"
                  inputMode="numeric"
                  required
                  value={budgetInput}
                  onChange={(e) => handleBudgetChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 32px',
                    borderRadius: '10px',
                    border: budgetError ? '2px solid #ef4444' : '1px solid #cbd5e1',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: 'var(--dark)',
                    outline: 'none',
                  }}
                />
              </div>
              {budgetError && <p style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '4px' }}>{budgetError}</p>}
            </div>

            {/* Coupons Section */}
            <div style={{ marginBottom: '1.5rem', backgroundColor: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label htmlFor="coupon-input" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                Apply Coupon Code
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  id="coupon-input"
                  type="text"
                  placeholder="e.g. FIRSTTIME"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  style={{
                    flexGrow: 1,
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                />
                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={handleClearCoupon}
                    style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '9px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem' }}
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon(couponCode)}
                    style={{ backgroundColor: 'var(--dark)', color: 'var(--primary)', padding: '9px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem' }}
                  >
                    Apply
                  </button>
                )}
              </div>

              {appliedCoupon && (
                <p style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600, marginTop: '8px' }}>
                  ✓ {appliedCoupon} applied: {bill.couponApplied?.description}
                </p>
              )}

              {bill.couponError && (
                <p style={{ fontSize: '0.82rem', color: '#dc2626', marginTop: '8px' }}>{bill.couponError}</p>
              )}

              {/* Coupon Chips */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
                {siteConfig.coupons.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleApplyCoupon(c.code)}
                    style={{
                      textAlign: 'left',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      backgroundColor: appliedCoupon === c.code ? '#dcfce7' : '#ffffff',
                      border: appliedCoupon === c.code ? '1px solid #86efac' : '1px dashed #cbd5e1',
                      fontSize: '0.78rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontWeight: 800, color: 'var(--dark)' }}>{c.code}</span>
                    <span style={{ color: '#047857', fontWeight: 600 }}>{c.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.92rem', color: '#475569' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal (Approx. Items)</span>
                <span style={{ fontWeight: 600, color: 'var(--dark)' }}>{formatCurrency(bill.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery Charges ({siteConfig.deliveryTimeText})</span>
                <span style={{ fontWeight: 600, color: 'var(--dark)' }}>{formatCurrency(bill.deliveryFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>GST / Taxes ({siteConfig.taxRatePercent}%)</span>
                <span style={{ fontWeight: 600, color: 'var(--dark)' }}>{formatCurrency(bill.taxAmount)}</span>
              </div>

              {/* Optional Charity Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f0fdf4', padding: '10px 12px', borderRadius: '10px', border: '1px solid #bbf7d0', marginTop: '4px' }}>
                <label htmlFor="charity-optin" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>
                  <input
                    id="charity-optin"
                    type="checkbox"
                    checked={optInCharity}
                    onChange={(e) => setOptInCharity(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                  />
                  <span>Donate {formatCurrency(siteConfig.feedingIndiaDonationAmount)} to Feeding India</span>
                </label>
                <span style={{ fontWeight: 700, color: '#166534' }}>
                  {optInCharity ? formatCurrency(siteConfig.feedingIndiaDonationAmount) : '₹0'}
                </span>
              </div>

              {bill.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: 700 }}>
                  <span>Coupon Discount</span>
                  <span>- {formatCurrency(bill.discount)}</span>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '2px solid #e2e8f0',
                  paddingTop: '12px',
                  marginTop: '6px',
                  fontSize: '1.3rem',
                  fontWeight: 900,
                  color: 'var(--dark)',
                }}
              >
                <span>Grand Total</span>
                <span style={{ color: 'var(--primary-hover)' }}>{formatCurrency(bill.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* 5. Payment Method Selector */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '1.25rem' }}>
              5. Select Payment Method
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Pay on Delivery (ACTIVE) */}
              <div
                onClick={() => setPaymentMethod('Pay-on-Delivery (COD)')}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '2px solid var(--primary)',
                  backgroundColor: '#f0fdf4',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  color: 'var(--dark)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Banknote size={20} color="var(--primary-hover)" />
                  <div>
                    <span>Pay-on-Delivery (Cash / UPI at Doorstep)</span>
                    <p style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 500, margin: 0 }}>Recommended & Active</p>
                  </div>
                </div>
                <Check size={20} color="var(--primary)" />
              </div>

              {/* Disabled Payment Methods with Coming Soon */}
              {[
                { label: 'UPI / Online Wallets (GPay, PhonePe)', icon: <Wallet size={18} /> },
                { label: 'Debit Card', icon: <CreditCard size={18} /> },
                { label: 'Credit Card', icon: <CreditCard size={18} /> },
              ].map((m) => (
                <div
                  key={m.label}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.9rem',
                    color: '#94a3b8',
                    cursor: 'not-allowed',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {m.icon}
                    <span>{m.label}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#64748b', padding: '3px 8px', borderRadius: '6px' }}>
                    Coming Soon
                  </span>
                </div>
              ))}
            </div>

            {/* Place Order CTA Button */}
            <button
              type="submit"
              disabled={submittingOrder || !!budgetError}
              style={{
                width: '100%',
                marginTop: '1.75rem',
                backgroundColor: budgetError ? '#cbd5e1' : 'var(--primary)',
                color: budgetError ? '#94a3b8' : '#064e3b',
                fontWeight: 800,
                fontSize: '1.1rem',
                padding: '14px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: budgetError ? 'none' : '0 6px 20px rgba(48, 232, 73, 0.4)',
                cursor: budgetError ? 'not-allowed' : 'pointer',
                opacity: submittingOrder ? 0.7 : 1,
              }}
            >
              {submittingOrder ? 'Placing Order...' : `Place Order • ${formatCurrency(bill.grandTotal)}`}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
