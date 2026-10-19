import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  X,
  Clock,
  Building,
  GraduationCap,
  Store,
  Compass,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react';
import {
  REWA_LOCALITIES,
  RewaLocality,
  searchRewaLocalities,
  reverseGeocodeCoordinates,
  calculateDistanceKm,
} from '../utils/locationService';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: string;
  onSelectLocation: (locationData: {
    address: string;
    area: string;
    lat: number;
    lng: number;
  }) => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [recommendations, setRecommendations] = useState<RewaLocality[]>([]);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [recentLocations, setRecentLocations] = useState<
    Array<{ address: string; area: string; lat: number; lng: number }>
  >([]);

  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent locations from localStorage
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('recentDeliveryLocations');
        if (saved) {
          setRecentLocations(JSON.parse(saved).slice(0, 4));
        }
      } catch {
        setRecentLocations([]);
      }

      // Default recommendations (most popular Rewa hubs)
      setRecommendations(searchRewaLocalities(''));
      setSearchInput('');
      setGpsError(null);

      // Auto focus input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Live recommendations filtering as user types
  useEffect(() => {
    const results = searchRewaLocalities(searchInput);
    setRecommendations(results);
  }, [searchInput]);

  if (!isOpen) return null;

  const handleSelect = (loc: {
    address: string;
    area: string;
    lat: number;
    lng: number;
  }) => {
    // Save to recents
    try {
      const existing = recentLocations.filter((r) => r.area !== loc.area);
      const updated = [loc, ...existing].slice(0, 5);
      setRecentLocations(updated);
      localStorage.setItem('recentDeliveryLocations', JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }

    onSelectLocation(loc);
    onClose();
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocatingGPS(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          const geoResult = await reverseGeocodeCoordinates(lat, lng);
          handleSelect(geoResult);
        } catch {
          handleSelect({
            address: `GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)}), Rewa`,
            area: 'Rewa',
            lat,
            lng,
          });
        } finally {
          setIsLocatingGPS(false);
        }
      },
      (err) => {
        setIsLocatingGPS(false);
        if (err.code === 1) {
          setGpsError('Location permission denied. Please pick an area below or type manually.');
        } else {
          setGpsError('Unable to detect GPS position. Please pick an area below.');
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const getCategoryIcon = (category: RewaLocality['category']) => {
    switch (category) {
      case 'educational':
        return <GraduationCap size={16} color="#0284c7" />;
      case 'medical':
        return <Building size={16} color="#dc2626" />;
      case 'commercial':
      case 'hub':
        return <Store size={16} color="#15803d" />;
      case 'market':
        return <Compass size={16} color="#d97706" />;
      default:
        return <MapPin size={16} color="var(--primary-hover)" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(3px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'fade-in 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px 16px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark)', margin: 0 }}>
              Choose Delivery Location
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '3px 0 0 0' }}>
              Stores & delivery times adapt to your selected Rewa address
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close location selector"
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Input Bar */}
        <div style={{ padding: '16px 24px 12px 24px', backgroundColor: '#ffffff' }}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1.5px solid #cbd5e1',
              padding: '0 14px',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <Search size={18} color="#64748b" style={{ flexShrink: 0, marginRight: '10px' }} />
            <input
              ref={inputRef}
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search area, landmark or street (e.g. Civil Lines, College Road)..."
              style={{
                width: '100%',
                padding: '12px 0',
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: '0.92rem',
                color: 'var(--dark)',
                fontWeight: 500,
              }}
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* GPS Auto-Detect Button */}
          <div style={{ marginTop: '12px' }}>
            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={isLocatingGPS}
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: '12px',
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#047857',
                fontWeight: 700,
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: isLocatingGPS ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {isLocatingGPS ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Detecting your GPS location...
                </>
              ) : (
                <>
                  <Navigation size={16} /> Use Current GPS Location (High Accuracy)
                </>
              )}
            </button>
          </div>

          {gpsError && (
            <div
              style={{
                marginTop: '8px',
                fontSize: '0.78rem',
                color: '#b91c1c',
                backgroundColor: '#fee2e2',
                padding: '6px 12px',
                borderRadius: '8px',
              }}
            >
              {gpsError}
            </div>
          )}
        </div>

        {/* Scrollable Content: Recommendations & Quick Hubs */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '4px 24px 24px 24px',
          }}
        >
          {/* Popular Delivery Hubs in Rewa Pills */}
          {!searchInput && (
            <div style={{ marginBottom: '18px' }}>
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#94a3b8',
                  letterSpacing: '0.5px',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Sparkles size={13} color="var(--primary-hover)" /> Popular Delivery Hubs in Rewa
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[
                  'Civil Lines',
                  'Sirmour Chowk',
                  'College Road',
                  'Hospital Road',
                  'Shilpi Plaza',
                  'Narendra Nagar',
                  'Subzi Mandi',
                  'APSU Campus',
                ].map((hubName) => {
                  const matched = REWA_LOCALITIES.find((l) => l.area.includes(hubName) || l.name.includes(hubName));
                  const isCurrentlyActive = currentLocation.toLowerCase().includes(hubName.toLowerCase());
                  return (
                    <button
                      key={hubName}
                      type="button"
                      onClick={() => {
                        if (matched) {
                          handleSelect({
                            address: `${matched.name}, Madhya Pradesh ${matched.pincode}`,
                            area: matched.area,
                            lat: matched.lat,
                            lng: matched.lng,
                          });
                        }
                      }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        fontSize: '0.82rem',
                        fontWeight: isCurrentlyActive ? 800 : 600,
                        backgroundColor: isCurrentlyActive ? '#dcfce7' : '#f1f5f9',
                        color: isCurrentlyActive ? '#15803d' : '#334155',
                        border: isCurrentlyActive ? '1px solid #86efac' : '1px solid #e2e8f0',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <MapPin size={12} color={isCurrentlyActive ? '#15803d' : '#64748b'} />
                      {hubName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Locations if available */}
          {!searchInput && recentLocations.length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#94a3b8',
                  letterSpacing: '0.5px',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Clock size={13} /> Recently Selected
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {recentLocations.map((rec, i) => (
                  <div
                    key={i}
                    onClick={() => handleSelect(rec)}
                    role="button"
                    tabIndex={0}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1px solid #f1f5f9',
                      backgroundColor: '#f8fafc',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <Clock size={16} color="#64748b" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--dark)' }}>
                        {rec.area}
                      </div>
                      <div
                        style={{
                          fontSize: '0.76rem',
                          color: '#64748b',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {rec.address}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Localities Recommendation List */}
          <div>
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: '#94a3b8',
                letterSpacing: '0.5px',
                marginBottom: '10px',
              }}
            >
              {searchInput
                ? `Matching Areas (${recommendations.length})`
                : 'All Recommended Localities in Rewa'}
            </div>

            {recommendations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b' }}>
                <MapPin size={28} color="#cbd5e1" style={{ margin: '0 auto 8px auto' }} />
                <p style={{ margin: 0, fontWeight: 600 }}>No matching area found in Rewa</p>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                  Try typing &quot;Civil Lines&quot;, &quot;Sirmour&quot;, &quot;College&quot;, or &quot;Hospital&quot;
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recommendations.map((loc) => {
                  const isSelected = currentLocation.toLowerCase().includes(loc.area.toLowerCase());
                  return (
                    <div
                      key={loc.id}
                      onClick={() =>
                        handleSelect({
                          address: `${loc.name}, Madhya Pradesh ${loc.pincode}`,
                          area: loc.area,
                          lat: loc.lat,
                          lng: loc.lng,
                        })
                      }
                      role="button"
                      tabIndex={0}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '14px',
                        border: isSelected ? '1.5px solid #86efac' : '1px solid #e2e8f0',
                        backgroundColor: isSelected ? '#f0fdf4' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                          e.currentTarget.style.borderColor = '#cbd5e1';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = '#ffffff';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                        }
                      }}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          backgroundColor: isSelected ? '#dcfce7' : '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {getCategoryIcon(loc.category)}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '2px',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.92rem',
                              fontWeight: 700,
                              color: 'var(--dark)',
                            }}
                          >
                            {loc.name}
                          </span>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: '#f1f5f9',
                              color: '#475569',
                              textTransform: 'uppercase',
                            }}
                          >
                            PIN {loc.pincode}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: '0.78rem',
                            color: '#64748b',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {loc.landmark}
                        </div>
                      </div>

                      {isSelected && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: '#22c55e',
                            color: '#ffffff',
                            flexShrink: 0,
                          }}
                        >
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer info note */}
        <div
          style={{
            padding: '12px 24px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #f1f5f9',
            fontSize: '0.78rem',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>Serving all Rewa city pin codes: 486001, 486002, 486003</span>
          <span style={{ fontWeight: 700, color: '#15803d' }}>● 100% Serviceable</span>
        </div>
      </div>
    </div>
  );
};

