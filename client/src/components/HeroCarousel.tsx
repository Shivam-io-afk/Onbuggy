import React, { useState, useEffect, useRef } from 'react';
import { Pill, ShoppingCart, Apple, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SlideConfig {
  id: 'medicine' | 'grocery' | 'vegetable';
  title: string;
  tagline: string;
  badge: string;
  bgColor: string;
  waveColor: string;
  items: string[];
}

const slides: SlideConfig[] = [
  {
    id: 'medicine',
    title: 'Medicines & Healthcare',
    tagline: 'Prescription drugs, wellness supplements, & baby care delivered in 20 mins.',
    badge: 'Express Pharmacy Delivery',
    bgColor: '#ff4500',
    waveColor: '#ff4500',
    items: [
      '/resorces/medicines/1.png',
      '/resorces/medicines/2.png',
      '/resorces/medicines/3.png',
      '/resorces/medicines/4.png',
      '/resorces/medicines/5.png',
      '/resorces/medicines/6.png',
      '/resorces/medicines/7.png',
      '/resorces/medicines/8.png',
    ],
  },
  {
    id: 'grocery',
    title: 'Daily Groceries',
    tagline: 'Fresh atta, basmati rice, cold-pressed oils, dairy & household staples.',
    badge: 'Supermarket Wholesale Rates',
    bgColor: '#0284c7',
    waveColor: '#0284c7',
    items: [
      '/resorces/grocery/1.png',
      '/resorces/grocery/2.png',
      '/resorces/grocery/3.png',
      '/resorces/grocery/4.png',
      '/resorces/grocery/5.png',
      '/resorces/grocery/6.png',
      '/resorces/grocery/7.png',
      '/resorces/grocery/8.png',
    ],
  },
  {
    id: 'vegetable',
    title: 'Vegetables & Fruits',
    tagline: 'Direct farm-picked crisp veggies, organic greens & sweet juicy fruits.',
    badge: '100% Farm Fresh Guarantee',
    bgColor: '#10b981',
    waveColor: '#10b981',
    items: [
      '/resorces/veg&Fruits/1.png',
      '/resorces/veg&Fruits/2.png',
      '/resorces/veg&Fruits/3.png',
      '/resorces/veg&Fruits/4.png',
      '/resorces/veg&Fruits/5.png',
      '/resorces/veg&Fruits/6.png',
      '/resorces/veg&Fruits/7.png',
      '/resorces/veg&Fruits/8.png',
    ],
  },
];

interface HeroCarouselProps {
  onSelectCategory?: (category: 'medicine' | 'grocery' | 'vegetable' | 'all') => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onSelectCategory }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const currentSlide = slides[currentIndex];

  const handlePillClick = (index: number) => {
    setUserInteracted(true);
    setCurrentIndex(index);
    if (onSelectCategory) {
      onSelectCategory(slides[index].id);
    }
  };

  const handlePrev = () => {
    setUserInteracted(true);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setUserInteracted(true);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured essentials categories"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Dynamic Background Banner */}
      <div
        style={{
          backgroundColor: currentSlide.bgColor,
          transition: 'background-color 0.8s ease',
          padding: '3rem 2rem 5.5rem 2rem',
          color: '#ffffff',
          position: 'relative',
        }}
      >
        <div
          role="group"
          aria-roledescription="slide"
          aria-label={`${currentIndex + 1} of ${slides.length}: ${currentSlide.title}`}
          aria-live={userInteracted ? 'polite' : 'off'}
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            alignItems: 'center',
          }}
        >
          {/* Left Text Block */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255,255,255,0.22)',
                backdropFilter: 'blur(8px)',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '1rem',
              }}
            >
              {currentSlide.id === 'medicine' && <Pill size={16} />}
              {currentSlide.id === 'grocery' && <ShoppingCart size={16} />}
              {currentSlide.id === 'vegetable' && <Apple size={16} />}
              {currentSlide.badge}
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
                fontWeight: 900,
                lineHeight: 1.15,
                letterSpacing: '-1px',
                marginBottom: '1.2rem',
                fontFamily: 'var(--font-brand)',
                textShadow: '0 3px 10px rgba(0,0,0,0.15)',
              }}
            >
              {currentSlide.title}
            </h1>

            <p
              style={{
                fontSize: '1.15rem',
                opacity: 0.95,
                lineHeight: 1.6,
                maxWidth: '560px',
                marginBottom: '2rem',
              }}
            >
              {currentSlide.tagline}
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link
                to={`/order-gothru?category=${currentSlide.id}`}
                style={{
                  backgroundColor: '#ffffff',
                  color: currentSlide.bgColor,
                  padding: '13px 26px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '1rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                Order from Local Shops <ArrowRight size={18} />
              </Link>
              <Link
                to="/order-gothru?category=medicine"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(8px)',
                  color: '#ffffff',
                  border: '2px solid rgba(255,255,255,0.4)',
                  padding: '12px 22px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.98rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                Upload Prescription / Slip
              </Link>
            </div>

            {/* Carousel Selector Controls (Prev / Next + Pills) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous slide"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  color: '#ffffff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
              >
                <ChevronLeft size={20} />
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                {slides.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => handlePillClick(idx)}
                    aria-label={`Slide ${idx + 1}: ${s.title}`}
                    style={{
                      backgroundColor: idx === currentIndex ? '#ffffff' : 'rgba(255,255,255,0.3)',
                      color: idx === currentIndex ? s.bgColor : '#ffffff',
                      padding: '8px 16px',
                      borderRadius: '9999px',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: 'none',
                      transition: 'all 0.25s ease',
                    }}
                  >
                    {s.id.toUpperCase()}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Next slide"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  color: '#ffffff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Right Floating Product Showcase */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '14px',
              padding: '1rem',
            }}
          >
            {currentSlide.items.slice(0, 8).map((src, i) => (
              <div
                key={src}
                className="animate-float"
                style={{
                  animationDelay: `${i * 0.25}s`,
                  backgroundColor: 'rgba(255,255,255,0.92)',
                  borderRadius: '16px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 18px rgba(0,0,0,0.12)',
                  height: '100px',
                }}
              >
                <img
                  src={src}
                  alt={`${currentSlide.title} essential product item ${i + 1}`}
                  style={{ maxHeight: '75px', maxWidth: '75px', objectFit: 'contain' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

