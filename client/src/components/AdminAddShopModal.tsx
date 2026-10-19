import React, { useState } from 'react';
import { Shop } from '../types';
import { adminService } from '../services/api';
import { Store, X, Loader2, Plus, CheckCircle2 } from 'lucide-react';

interface AdminAddShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShopAdded: (newShop: Shop) => void;
}

export const AdminAddShopModal: React.FC<AdminAddShopModalProps> = ({ isOpen, onClose, onShopAdded }) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [category, setCategory] = useState<'medicine' | 'grocery' | 'vegetable'>('grocery');
  const [categoryLabel, setCategoryLabel] = useState('');
  const [phone, setPhone] = useState('+91 98');
  const [address, setAddress] = useState('Civil Lines, Rewa, Madhya Pradesh');
  const [deliveryTimeMin, setDeliveryTimeMin] = useState(25);
  const [distanceKm, setDistanceKm] = useState(1.5);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a valid store name');
      return;
    }

    setLoading(true);
    try {
      const defaultImg =
        category === 'medicine'
          ? 'resorces/medicines/1.png'
          : category === 'grocery'
          ? 'resorces/grocery/1.png'
          : 'resorces/veg&Fruits/1.png';

      const res = await adminService.createShop({
        name: name.trim(),
        category,
        categoryLabel: categoryLabel.trim() || `${name} • Verified Local Partner`,
        phone: phone.trim(),
        address: address.trim(),
        deliveryTimeMin: Number(deliveryTimeMin) || 25,
        distanceKm: Number(distanceKm) || 1.5,
        description: description.trim() || 'Verified merchant partner delivering fresh essentials across Rewa.',
        image: defaultImg,
        isOpen: true,
      });

      if (res.data.success) {
        onShopAdded(res.data.data);
        onClose();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add store');
    } finally {
      setLoading(false);
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
          maxWidth: '540px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Store size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                Onboard New Merchant Partner
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                Add local medical, grocery, or vegetable store in Rewa
              </p>
            </div>
          </div>

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

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Store Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rewa Medicos & Wellness"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                  }}
                >
                  <option value="medicine">Medicines & Pharmacy</option>
                  <option value="grocery">Daily Groceries</option>
                  <option value="vegetable">Fresh Farm Produce</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Contact Phone
                </label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Store Tagline / Subtitle
              </label>
              <input
                type="text"
                placeholder="e.g. 24x7 Emergency Chemist • 100% Genuine Medicines"
                value={categoryLabel}
                onChange={(e) => setCategoryLabel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Store Physical Address
              </label>
              <input
                type="text"
                placeholder="e.g. Shop 4, Sirmour Chauraha, Rewa, MP 486001"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Delivery Time (Mins)
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={deliveryTimeMin}
                  onChange={(e) => setDeliveryTimeMin(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Hub Distance (Km)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="50"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Store Description
              </label>
              <textarea
                rows={2}
                placeholder="Brief description of verified merchant offerings..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '11px',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#475569',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 2,
                padding: '11px',
                borderRadius: '10px',
                backgroundColor: 'var(--primary)',
                border: 'none',
                color: '#064e3b',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(48,232,73,0.3)',
              }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Onboard & Publish Store
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
