import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { HeroCarousel } from '../components/HeroCarousel';
import { ShopCard } from '../components/ShopCard';
import { ShopCardSkeleton } from '../components/ShopCardSkeleton';
import { Shop } from '../types';
import { shopService } from '../services/api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useAuth } from '../context/AuthContext';
import { LocationPickerModal } from '../components/LocationPickerModal';
import { Search, SlidersHorizontal, Sparkles, X, Tag, ShieldCheck, Zap, ArrowRight, Loader2, MapPin } from 'lucide-react';

export const HomePage: React.FC = () => {
  useDocumentTitle(
    'Onbuggy - Instant Hyperlocal Delivery in Rewa',
    'Get medicines, groceries, and fresh produce delivered to your doorstep in 20 minutes from trusted local stores.'
  );

  const { userLocation, userCoordinates, setUserLocation } = useAuth();
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const urlCategory = searchParams.get('cat') || searchParams.get('category') || 'all';
  const urlSearch = searchParams.get('q') || '';
  const urlSort = (searchParams.get('sort') as 'relevance' | 'time' | 'rating' | 'near') || 'relevance';

  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory);
  const [searchTerm, setSearchTerm] = useState<string>(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(urlSearch);
  const [sortBy, setSortBy] = useState<'relevance' | 'time' | 'rating' | 'near'>(urlSort);

  // Sync state when URL params change (e.g. back/forward navigation or navbar click)
  useEffect(() => {
    const cat = searchParams.get('cat') || searchParams.get('category') || 'all';
    const q = searchParams.get('q') || '';
    const s = (searchParams.get('sort') as any) || 'relevance';

    setSelectedCategory(cat);
    setSearchTerm(q);
    setDebouncedSearch(q);
    setSortBy(s);
  }, [searchParams]);

  // Debounce search input by 250ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);

      // Sync to URL
      const newParams = new URLSearchParams(searchParams);
      if (searchTerm.trim()) {
        newParams.set('q', searchTerm.trim());
      } else {
        newParams.delete('q');
      }
      setSearchParams(newParams, { replace: true });
    }, 250);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const updateCategory = (cat: string) => {
    setSelectedCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'all') {
      newParams.delete('cat');
      newParams.delete('category');
    } else {
      newParams.set('cat', cat);
    }
    setSearchParams(newParams, { replace: true });
  };

  const updateSort = (sort: 'relevance' | 'time' | 'rating' | 'near') => {
    setSortBy(sort);
    const newParams = new URLSearchParams(searchParams);
    if (sort === 'relevance') {
      newParams.delete('sort');
    } else {
      newParams.set('sort', sort);
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('q');
    setSearchParams(newParams, { replace: true });
  };

  const fetchShops = async () => {
    setLoading(true);
    try {
      const res = await shopService.getShops({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        search: debouncedSearch.trim() || undefined,
        sortBy,
        userLat: userCoordinates?.lat,
        userLng: userCoordinates?.lng,
        location: userLocation,
      });
      if (res.data.success) {
        setShops(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching shops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, [selectedCategory, debouncedSearch, sortBy, userCoordinates?.lat, userCoordinates?.lng, userLocation]);

  return (
    <div>
      {/* Dynamic Animated Carousel */}
      <HeroCarousel onSelectCategory={(cat) => updateCategory(cat)} />

      {/* Main Section with Search Bar Overlapping Wave */}
      <div id="categories" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem 5rem 1.5rem' }}>
        {/* Search Bar - Overlapping the wave */}
        <div
          style={{
            maxWidth: '720px',
            margin: '-52px auto 2.5rem auto',
            position: 'relative',
            zIndex: 20,
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '9999px',
              padding: '6px 8px 6px 20px',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
              border: '2px solid #e2e8f0',
              transition: 'border-color 0.2s',
            }}
          >
            <Search size={20} color="#64748b" style={{ flexShrink: 0, marginRight: '10px' }} />
            <input
              type="text"
              aria-label="Search shops, items or medications"
              placeholder="Search shops, essentials or medicines (e.g. Paracetamol, Atta, Farm Fresh)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                width: '100%',
                fontSize: '1rem',
                color: 'var(--dark)',
                padding: '10px 0',
                backgroundColor: 'transparent',
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search query"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '6px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  marginRight: '6px',
                }}
              >
                <X size={18} />
              </button>
            )}
            <button
              type="button"
              onClick={fetchShops}
              style={{
                backgroundColor: 'var(--primary)',
                color: '#064e3b',
                borderRadius: '9999px',
                padding: '10px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 700,
                fontSize: '0.92rem',
                border: 'none',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              Search
            </button>
          </div>
        </div>

        {/* Category Pills & Shop Filters */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '2rem',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '1.25rem',
          }}
        >
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Stores' },
              { id: 'medicine', label: 'Medicines & Health' },
              { id: 'grocery', label: 'Daily Groceries' },
              { id: 'vegetable', label: 'Vegetables & Fruits' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => updateCategory(tab.id)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '9999px',
                  fontSize: '0.9rem',
                  fontWeight: selectedCategory === tab.id ? 700 : 500,
                  backgroundColor: selectedCategory === tab.id ? 'var(--dark)' : '#ffffff',
                  color: selectedCategory === tab.id ? 'var(--primary)' : '#475569',
                  border: selectedCategory === tab.id ? '1px solid var(--dark)' : '1px solid #cbd5e1',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort By Filter Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <SlidersHorizontal size={14} /> Sort By:
            </span>
            {[
              { id: 'relevance', label: 'Relevance' },
              { id: 'time', label: 'Delivery Time' },
              { id: 'rating', label: 'Rating' },
              { id: 'near', label: 'Near-By' },
            ].map((sort) => (
              <button
                key={sort.id}
                onClick={() => updateSort(sort.id as any)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: sortBy === sort.id ? 700 : 500,
                  backgroundColor: sortBy === sort.id ? '#ecfdf5' : '#f1f5f9',
                  color: sortBy === sort.id ? '#047857' : '#64748b',
                  border: sortBy === sort.id ? '1px solid #a7f3d0' : '1px solid transparent',
                  cursor: 'pointer',
                }}
              >
                {sort.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Delivery Location Status Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '12px 18px',
            marginBottom: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                backgroundColor: '#ecfdf5',
                color: '#047857',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <MapPin size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Delivering to Address
              </span>
              <div style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--dark)' }}>
                {userLocation}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
              Live Dynamic ETA Active
            </span>
            <button
              type="button"
              onClick={() => setIsLocModalOpen(true)}
              style={{
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '7px 14px',
                borderRadius: '10px',
                fontSize: '0.84rem',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Change Location &rarr;
            </button>
          </div>
        </div>

        {/* Results Counter Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '8px' }}>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--dark)' }}>
            Available Verified Stores ({shops.length})
          </h2>
          <span style={{ fontSize: '0.88rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Sparkles size={14} color="var(--primary-hover)" /> Fast 20–35 min deliveries in Rewa
          </span>
        </div>

        {/* Shops Grid */}
        {loading ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '1.5rem', color: '#64748b' }}>
              <Loader2 size={18} className="animate-spin" color="var(--primary-hover)" />
              <span style={{ fontSize: '0.92rem', fontWeight: 600 }}>
                Syncing verified stores delivering to {userLocation}...
              </span>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <ShopCardSkeleton key={n} />
              ))}
            </div>
          </div>
        ) : shops.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4.5rem 2rem',
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              maxWidth: '540px',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <Search size={24} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '8px' }}>
              {debouncedSearch ? `No results found for "${debouncedSearch}"` : 'No stores found in this category'}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
              We couldn't find matching store names, categories, or products. Try a different keyword or reset filters.
            </p>
            {debouncedSearch ? (
              <button
                type="button"
                onClick={handleClearSearch}
                style={{
                  backgroundColor: 'var(--primary)',
                  color: '#064e3b',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Clear Search
              </button>
            ) : (
              <button
                type="button"
                onClick={() => updateCategory('all')}
                style={{
                  backgroundColor: 'var(--dark)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Show All Stores
              </button>
            )}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {shops.map((shop) => (
              <ShopCard key={shop._id} shop={shop} />
            ))}
          </div>
        )}

        {/* Promotional Offers & Quick Highlights with ₹ Currency (No $) */}
        <div style={{ marginTop: '5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--dark)' }}>
              Exclusive Offers & Health Tips
            </h3>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Curated for you</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Promo Card 1: FIRSTTIME Coupon */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '1.75rem',
                border: '1px solid #e2e8f0',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', right: '-15px', top: '-15px', width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#ecfdf5', zIndex: 0 }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <span
                  style={{
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Tag size={13} /> WELCOME VOUCHER
                </span>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--dark)', marginTop: '12px', marginBottom: '6px' }}>
                  Flat 50% OFF up to ₹150
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  Apply coupon code <strong>FIRSTTIME</strong> at checkout on orders of ₹200 or more. Valid on all medicine and grocery deliveries.
                </p>
              </div>
              <Link
                to="/order-gothru?coupon=FIRSTTIME"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#047857',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                }}
              >
                Claim ₹150 Discount <ArrowRight size={16} />
              </Link>
            </div>

            {/* Promo Card 2: Express Delivery */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '1.75rem',
                border: '1px solid #e2e8f0',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', right: '-15px', top: '-15px', width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#eff6ff', zIndex: 0 }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <span
                  style={{
                    backgroundColor: '#e0f2fe',
                    color: '#0369a1',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Zap size={13} /> 20-MIN EXPRESS
                </span>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--dark)', marginTop: '12px', marginBottom: '6px' }}>
                  Fixed ₹30 Hyperlocal Delivery
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  No surge pricing during rain or peak rush hours. Dedicated riders pick up directly from verified chemists and farm stores.
                </p>
              </div>
              <a
                href="#categories"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#0369a1',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                }}
              >
                Explore Nearby Shops <ArrowRight size={16} />
              </a>
            </div>

            {/* Promo Card 3: Prescription Safety */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '1.75rem',
                border: '1px solid #e2e8f0',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', right: '-15px', top: '-15px', width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#fff7ed', zIndex: 0 }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <span
                  style={{
                    backgroundColor: '#ffedd5',
                    color: '#c2410c',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <ShieldCheck size={13} /> HEALTH SAFETY
                </span>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--dark)', marginTop: '12px', marginBottom: '6px' }}>
                  Rx Prescription Fulfillment
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  Upload your doctor's slip. Licensed neighborhood pharmacists verify dosage, dispense sealed packs, and ensure Schedule H/X compliance.
                </p>
              </div>
              <Link
                to="/order-gothru?category=medicine"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#c2410c',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                }}
              >
                Upload Prescription Now <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Rewa Location Picker Modal */}
      <LocationPickerModal
        isOpen={isLocModalOpen}
        onClose={() => setIsLocModalOpen(false)}
        currentLocation={userLocation}
        onSelectLocation={(data) => {
          setUserLocation(data.address, {
            lat: data.lat,
            lng: data.lng,
            area: data.area,
          });
        }}
      />
    </div>
  );
};

