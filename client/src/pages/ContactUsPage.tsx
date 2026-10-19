import React, { useState } from 'react';
import { contactService } from '../services/api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { siteConfig } from '../config/site';
import { Mail, User, MessageSquare, Send, CheckCircle2, Phone, MapPin, MessageCircle, Loader2 } from 'lucide-react';

export const ContactUsPage: React.FC = () => {
  useDocumentTitle('Contact Support - Onbuggy', 'Get in touch with Onbuggy customer care, delivery coordination, or store partnership in Rewa.');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Service Related');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await contactService.submitMessage({ name, email, topic, message });
      if (res.data.success) {
        setSubmitted(true);
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setErrorMsg(res.data.message || 'Failed to submit your message');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit your message. Please check connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 1.5rem 5rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--dark)', fontFamily: 'var(--font-brand)' }}>
          Contact & Customer Support
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.05rem', marginTop: '6px' }}>
          Have questions or need rider assistance? Feel free to reach out to our team 24/7.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'start' }}>
        {/* Left Information Card */}
        <div style={{ backgroundColor: 'var(--dark)', color: '#ffffff', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 10px 30px rgba(18, 19, 49, 0.2)' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem', color: '#ffffff' }}>
            Get In Touch
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            We are always here to assist you with order inquiries, vendor onboarding, or prescription delivery coordination.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'rgba(48,232,73,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Phone size={18} color="var(--primary)" />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone Support</p>
                <a href={`tel:${siteConfig.contactPhone.replace(/\s+/g, '')}`} style={{ fontWeight: 600, color: '#ffffff', textDecoration: 'none' }}>
                  {siteConfig.contactPhone}
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'rgba(48,232,73,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Mail size={18} color="var(--primary)" />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Support</p>
                <a href={`mailto:${siteConfig.contactEmail}`} style={{ fontWeight: 600, color: '#ffffff', textDecoration: 'none' }}>
                  {siteConfig.contactEmail}
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'rgba(48,232,73,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MessageCircle size={18} color="var(--primary)" />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>WhatsApp Instant Chat</p>
                <a
                  href={`https://wa.me/919826112233?text=${encodeURIComponent('Hello Onbuggy Support, I need assistance with an order.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontWeight: 600, color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  Chat on WhatsApp &rarr;
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'rgba(48,232,73,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin size={18} color="var(--primary)" />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Operations Headquarters</p>
                <p style={{ fontWeight: 600, fontSize: '0.92rem' }}>Civil Lines, Rewa, Madhya Pradesh 486001</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '2.5rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <CheckCircle2 size={48} color="var(--primary-hover)" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '8px' }}>
                Thank You for Reaching Out!
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Your message has been safely saved in our support desk. An agent will respond to your email within 2 hours.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                style={{
                  backgroundColor: 'var(--primary)',
                  color: '#064e3b',
                  fontWeight: 700,
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {errorMsg && (
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem' }}>
                  {errorMsg}
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Your Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: '#94a3b8' }} />
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="e.g. Anand Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: '#94a3b8' }} />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="e.g. anand@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Issue / Query Category
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', backgroundColor: '#ffffff' }}
                >
                  <option value="Service Related">Service Related (Delivery coverage, app questions)</option>
                  <option value="Delivery Related">Delivery Related (Delayed order, rider coordination)</option>
                  <option value="Business Related">Shop Partnership (Become a verified store vendor)</option>
                  <option value="Product & Order Related">Order Quality / Prescription Assistance</option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Description / Message (min 10 characters)
                </label>
                <textarea
                  required
                  minLength={10}
                  rows={4}
                  maxLength={500}
                  placeholder="Please describe your question or issue in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  backgroundColor: 'var(--primary)',
                  color: '#064e3b',
                  fontWeight: 800,
                  fontSize: '1rem',
                  padding: '13px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(48, 232, 73, 0.35)',
                  marginTop: '0.5rem',
                  opacity: submitting ? 0.7 : 1,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  border: 'none',
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    Send Message <Send size={16} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

