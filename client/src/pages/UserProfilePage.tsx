import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Mail, MapPin, CheckCircle, ShieldCheck, ShoppingBag } from 'lucide-react';
import { authService } from '../services/api';

export const UserProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      const parts = (user.name || '').split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setStreet(user.address?.street || '');
      setCity(user.address?.city || '');
      setState(user.address?.state || '');
      setPincode(user.address?.pincode || '');
    }

    authService.getMe().then((res) => {
      if (res.data.success) {
        setTotalOrders(res.data.stats?.totalOrders || 0);
      }
    });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setSaving(true);

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const res = await updateProfile({
      name: fullName,
      phone,
      address: {
        street,
        city,
        state,
        pincode,
      },
    });

    setSaving(false);
    if (res.success) {
      setSuccessMsg('Your profile details were updated in MongoDB successfully!');
    } else {
      setErrorMsg(res.message || 'Failed to update profile');
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '3rem 1.5rem 5rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <img
          src="/resorces/other/useravatar.png"
          alt="Avatar"
          style={{ width: '84px', height: '84px', borderRadius: '50%', border: '4px solid var(--primary)', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-md)' }}
        />
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--dark)' }}>
            {user?.name || 'User Profile'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            {user?.email} • Role: <strong style={{ color: 'var(--primary-hover)', textTransform: 'capitalize' }}>{user?.role || 'Customer'}</strong>
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#ecfdf5', color: '#059669' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Orders Placed</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--dark)' }}>{totalOrders}</h3>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Account Status</p>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#16a34a' }}>Verified Active</h3>
          </div>
        </div>
      </div>

      {/* Main Profile Edit Form */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '2.5rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '1.5rem' }}>
          Personal Information
        </h3>

        {successMsg && (
          <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '12px 16px', borderRadius: '10px', fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} /> {successMsg}
          </div>
        )}

        {errorMsg && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '10px', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                First Name
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                Last Name
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={email}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.95rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
              />
            </div>
          </div>

          {/* Address Fields */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--dark)', marginTop: '0.5rem', marginBottom: '1rem' }}>
              Default Delivery Address
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                  Street / Area
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. 12-B Green Park Road, Civil Lines"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.92rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Rewa"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.92rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Madhya Pradesh"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.92rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="486001"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.92rem', outline: 'none' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              alignSelf: 'flex-start',
              backgroundColor: 'var(--primary)',
              color: '#064e3b',
              fontWeight: 800,
              fontSize: '0.95rem',
              padding: '12px 28px',
              borderRadius: '10px',
              marginTop: '1rem',
              boxShadow: '0 4px 14px rgba(48, 232, 73, 0.35)',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

