import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, Award, Clock, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { siteConfig } from '../config/site';

const SLIDES = [
  {
    title: 'Our Hyperlocal Mission',
    image: '/resorces/About/hii.png',
    text: `Onbuggy was built to bridge the gap between verified neighborhood essentials and everyday convenience. In a world where families need emergency medications, daily fresh milk, or wholesome vegetables within minutes, we partner directly with licensed chemists and local kirana merchants right here in ${siteConfig.serviceableCity}.`,
  },
  {
    title: 'Who We Are',
    image: '/resorces/About/who-we-are.png',
    text: 'We are a dedicated local logistics and technology collective focused on keeping community commerce thriving. Rather than routing goods through distant warehouses, Onbuggy empowers neighborhood store owners with rapid order matching, transparent pricing, and trusted doorstep courier delivery.',
  },
  {
    title: 'Fast & Responsible Fulfillment',
    image: '/resorces/About/we.png',
    text: `With an average turnaround of ${siteConfig.avgDeliveryMins} minutes, our riders ensure temperature-safe handling of prescription medicines, farm greens, and groceries. Every order is verified with tamper-evident packaging and direct merchant receipts.`,
  },
];

export const AboutUsPage: React.FC = () => {
  useDocumentTitle('About Us - Onbuggy', 'Learn about Onbuggy, our mission, hyper-local partner network and delivery standards.');

  const [currentSlide, setCurrentSlide] = useState(0);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  };

  const slide = SLIDES[currentSlide];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 1.5rem 5rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--dark)', fontFamily: 'var(--font-brand)' }}>
          About Onbuggy
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '6px' }}>
          Discover our vision for instant, transparent hyperlocal essentials delivery in {siteConfig.serviceableCity}.
        </p>
      </div>

      {/* Main Interactive Carousel Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 10px 35px rgba(0,0,0,0.06)',
          border: '1px solid #e2e8f0',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          minHeight: '380px',
          marginBottom: '3rem',
        }}
      >
        {/* Left Illustration */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2.5rem',
            borderRight: '1px solid #f1f5f9',
          }}
        >
          <img
            src={slide.image}
            alt={slide.title}
            style={{ maxHeight: '250px', maxWidth: '100%', objectFit: 'contain' }}
          />
        </div>

        {/* Right Narrative */}
        <div style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--primary-hover)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px',
            }}
          >
            Story {currentSlide + 1} of {SLIDES.length}
          </span>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--dark)', marginBottom: '1.25rem' }}>
            {slide.title}
          </h2>
          <p style={{ fontSize: '1.02rem', color: '#475569', lineHeight: 1.7, marginBottom: '2rem' }}>
            {slide.text}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous story slide"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--dark)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <ChevronLeft size={22} />
            </button>
            <div style={{ display: 'flex', gap: '6px' }}>
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  style={{
                    width: i === currentSlide ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '9999px',
                    backgroundColor: i === currentSlide ? 'var(--primary)' : '#cbd5e1',
                    cursor: 'pointer',
                    transition: 'all 0.25s',
                    border: 'none',
                    padding: 0,
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next story slide"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'var(--dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Key Metric Highlights Synchronized with siteConfig */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '1.75rem', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <Clock size={32} color="var(--primary-hover)" style={{ margin: '0 auto 10px auto' }} />
          <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--dark)' }}>
            {siteConfig.avgDeliveryMins} Mins
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Average Express Delivery</p>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.75rem', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <Users size={32} color="#0284c7" style={{ margin: '0 auto 10px auto' }} />
          <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--dark)' }}>12+ Stores</h3>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Verified Local Partners</p>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.75rem', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <Award size={32} color="#f59e0b" style={{ margin: '0 auto 10px auto' }} />
          <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--dark)' }}>100%</h3>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Genuine Quality Guarantee</p>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.75rem', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <Heart size={32} color="#ef4444" style={{ margin: '0 auto 10px auto' }} />
          <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--dark)' }}>
            ₹{siteConfig.feedingIndiaDefaultDonation}
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Opt-in Feeding India Support</p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link
          to="/order-gothru"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--primary)',
            color: '#064e3b',
            fontWeight: 800,
            padding: '13px 28px',
            borderRadius: '12px',
          }}
        >
          Explore Local Stores <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
};

