import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { siteConfig } from '../config/site';
import { ShieldCheck, FileText, ExternalLink, HelpCircle, Phone, Mail } from 'lucide-react';

interface TermSection {
  id: string;
  title: string;
}

const SECTIONS: TermSection[] = [
  { id: 'sec-intro', title: '1. Introduction & Acceptance' },
  { id: 'sec-definitions', title: '2. Definitions' },
  { id: 'sec-eligibility', title: '3. Eligibility & Account Use' },
  { id: 'sec-changes', title: '4. Changes & Modifications to Terms' },
  { id: 'sec-medicines', title: '5. Medicines & Prescription Dispensation' },
  { id: 'sec-orders', title: '6. Ordering, Pricing & Payments' },
  { id: 'sec-cancellations', title: '7. Cancellations & Refund Policy' },
  { id: 'sec-conduct', title: '8. User Conduct & Acceptable Use' },
  { id: 'sec-privacy', title: '9. Privacy & DPDP Compliance' },
  { id: 'sec-liability', title: '10. Limitation of Liability' },
  { id: 'sec-governing', title: '11. Governing Law & Jurisdiction' },
  { id: 'sec-grievance', title: '12. Grievance Officer & Contact' },
];

export const TermsConditionsPage: React.FC = () => {
  useDocumentTitle('Terms & Conditions - Onbuggy', 'Read the terms and conditions for using Onbuggy instant delivery platform.');

  const [activeId, setActiveId] = useState('sec-intro');

  const scrollTo = (id: string) => {
    setActiveId(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveId(SECTIONS[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 1.5rem 5rem 1.5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#ecfdf5',
            color: '#047857',
            fontWeight: 700,
            fontSize: '0.85rem',
            padding: '4px 12px',
            borderRadius: '9999px',
            marginBottom: '0.75rem',
          }}
        >
          <ShieldCheck size={16} /> Official Terms of Service
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--dark)', fontFamily: 'var(--font-brand)' }}>
          Terms & Conditions
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Effective Date: January 1, 2026 • Last Revised: October 2026 • Applies to all users of {siteConfig.name}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 300px) 1fr', gap: '3rem', alignItems: 'start' }}>
        {/* Left Sticky Table of Contents */}
        <aside
          aria-label="Table of contents"
          style={{
            position: 'sticky',
            top: '85px',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '1.25rem',
            border: '1px solid #e2e8f0',
            boxShadow: 'var(--shadow-sm)',
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto',
          }}
        >
          <h4
            style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              color: 'var(--dark)',
              textTransform: 'uppercase',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <FileText size={16} /> Table of Contents
          </h4>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {SECTIONS.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollTo(sec.id)}
                style={{
                  textAlign: 'left',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.84rem',
                  fontWeight: activeId === sec.id ? 700 : 500,
                  backgroundColor: activeId === sec.id ? '#ecfdf5' : 'transparent',
                  color: activeId === sec.id ? '#047857' : '#475569',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  lineHeight: 1.4,
                }}
              >
                {sec.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* Right Legal Articles */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '2.5rem',
            border: '1px solid #e2e8f0',
            boxShadow: 'var(--shadow-sm)',
            lineHeight: 1.7,
            color: '#334155',
          }}
        >
          <section id="sec-intro" style={{ marginBottom: '2.5rem', scrollMarginTop: '100px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '0.75rem' }}>
              1. Introduction & Acceptance
            </h2>
            <p>
              Welcome to <strong>{siteConfig.legalEntity}</strong> ("Onbuggy", "Company", "we", "us", or "our"). These Terms and Conditions ("Terms") govern your access to and use of the Onbuggy web application, mobile interfaces, software, and hyperlocal delivery brokerage platform.
            </p>
            <p style={{ marginTop: '0.75rem' }}>
              By accessing, browsing, registering on, or placing orders through Onbuggy, you acknowledge that you have read, understood, and agree to be bound by these Terms, together with our{' '}
              <Link to="/privacy-policy" style={{ color: 'var(--primary-hover)', fontWeight: 600, textDecoration: 'underline' }}>
                Privacy Policy
              </Link>
              . If you do not agree to these Terms, you must discontinue using our services immediately.
            </p>
          </section>

          <section id="sec-definitions" style={{ marginBottom: '2.5rem', scrollMarginTop: '100px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '0.75rem' }}>
              2. Definitions
            </h2>
            <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>"Customer" or "User":</strong> Any individual or entity browsing or placing orders on the Onbuggy platform.</li>
              <li><strong>"Merchant Partner" or "Store":</strong> Verified third-party neighborhood businesses, including licensed retail pharmacies, grocery stores, and farm vendors registered with Onbuggy.</li>
              <li><strong>"Delivery Partner" / "Rider":</strong> Independent logistics contractors assigned to transport packaged orders from merchants to customer doorsteps.</li>
              <li><strong>"Prescription Order":</strong> Any medical order requiring a valid doctor prescription under Indian pharmaceutical laws.</li>
            </ul>
          </section>

          <section id="sec-eligibility" style={{ marginBottom: '2.5rem', scrollMarginTop: '100px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '0.75rem' }}>
              3. Eligibility & Account Use
            </h2>
            <p>
              You must be at least 18 years of age to register an account and place orders on Onbuggy. If you are under 18, you may use Onbuggy only through the active account and direct supervision of a parent or legal guardian who agrees to be bound by these Terms.
            </p>
            <p style={{ marginTop: '0.75rem' }}>
              You agree to provide accurate, current, and complete registration information (including your legal name and valid 10-digit Indian phone number) and are responsible for safeguarding your login credentials.
            </p>
          </section>

          <section id="sec-changes" style={{ marginBottom: '2.5rem', scrollMarginTop: '100px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '0.75rem' }}>
              4. Changes & Modifications to Terms
            </h2>
            <p>
              Onbuggy reserves the right, at our sole discretion, to modify or replace these Terms at any time. When material revisions are made, we will update the "Last Revised" date at the top of this page. Your continued use of the platform after any such revisions constitutes your acceptance of the updated Terms.
            </p>
          </section>

          <section id="sec-medicines" style={{ marginBottom: '2.5rem', scrollMarginTop: '100px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '0.75rem' }}>
              5. Medicines & Prescription Dispensation
            </h2>
            <p>
              Onbuggy operates strictly as a technology facilitator and does not itself practice medicine or dispense pharmaceuticals:
            </p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>Schedule H and Schedule X Drugs:</strong> Medications categorized under Schedule H, H1, or X of the Drugs and Cosmetics Act, 1940 and Rules, 1945 will only be dispensed upon upload and verification of a valid, signed prescription from a registered medical practitioner.</li>
              <li><strong>Pharmacist Discretion:</strong> The registered pharmacist at the fulfilling medical store reserves the final legal right to verify the prescription or decline fulfillment if the slip is unclear, forged, altered, or expired.</li>
              <li><strong>No Emergency Services:</strong> Onbuggy is not an emergency medical responder. For urgent medical emergencies, immediately contact your local hospital or ambulance hotline.</li>
            </ul>
          </section>

          <section id="sec-orders" style={{ marginBottom: '2.5rem', scrollMarginTop: '100px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '0.75rem' }}>
              6. Ordering, Pricing & Payments
            </h2>
            <p>
              In our assisted and prescription order flows, the entered value represents an estimated budget. The final invoice is calculated by the merchant based on packaged weights and stamped MRPs. All applicable statutory taxes ({siteConfig.gstTaxPercentage}% GST) and our standard ₹{siteConfig.deliveryFee} delivery fee are itemized transparently.
            </p>
            <p style={{ marginTop: '0.75rem' }}>
              Cash on Delivery (COD) is our standard payment method. Promotional coupons (such as FIRSTTIME and BAPPA20) are subject to verified order value minimums and discount caps as displayed in the checkout summary.
            </p>
          </section>

          <section id="sec-cancellations" style={{ marginBottom: '2.5rem', scrollMarginTop: '100px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '0.75rem' }}>
              7. Cancellations & Refund Policy
            </h2>
            <p>
              Orders may be cancelled freely through the "My Orders" tab while the order status is "Order Placed" or "Processing". Once the order has been handed to the rider and marked "Out for Delivery", cancellation is no longer permitted because fresh perishable items or dispensed medications cannot be restocked.
            </p>
            <p style={{ marginTop: '0.75rem' }}>
              In the rare event of damaged goods, missing items, or expired medication, notify our customer support team within 2 hours of delivery with photographic evidence. Approved refunds are credited back via original payment channel or UPI within 3–5 business days.
            </p>
          </section>

          <section id="sec-conduct" style={{ marginBottom: '2.5rem', scrollMarginTop: '100px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '0.75rem' }}>
              8. User Conduct & Acceptable Use
            </h2>
            <p>
              You agree not to misuse Onbuggy. Prohibited conduct includes: submitting fraudulent orders, uploading fabricated prescriptions, harassing delivery partners or store personnel, scraping catalog data with automated bots, and reverse-engineering the platform.
            </p>
          </section>

          <section id="sec-privacy" style={{ marginBottom: '2.5rem', scrollMarginTop: '100px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '0.75rem' }}>
              9. Privacy & DPDP Compliance
            </h2>
            <p>
              Your personal data, delivery addresses, and medical prescription images are handled in strict compliance with the <em>Digital Personal Data Protection Act, 2023 (India)</em>. Please review our comprehensive{' '}
              <Link to="/privacy-policy" style={{ color: 'var(--primary-hover)', fontWeight: 600, textDecoration: 'underline' }}>
                Privacy Policy
              </Link>{' '}
              for details on collection purposes, data minimization, and your statutory rights to access and erasure.
            </p>
          </section>

          <section id="sec-liability" style={{ marginBottom: '2.5rem', scrollMarginTop: '100px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '0.75rem' }}>
              10. Limitation of Liability
            </h2>
            <p>
              Onbuggy acts as an intermediary connecting customers with independent neighborhood merchants and delivery riders. To the maximum extent permitted by law, Onbuggy shall not be liable for merchant product defects, prescription drug side effects, or delivery delays resulting from severe weather or road blockages.
            </p>
          </section>

          <section id="sec-governing" style={{ marginBottom: '2.5rem', scrollMarginTop: '100px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '0.75rem' }}>
              11. Governing Law & Jurisdiction
            </h2>
            <p>
              These Terms and any dispute or claim arising out of or in connection with them shall be governed by and construed in accordance with the laws of the Republic of India. The courts located in Rewa, Madhya Pradesh shall have exclusive jurisdiction over any proceedings.
            </p>
          </section>

          <section id="sec-grievance" style={{ scrollMarginTop: '100px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '0.75rem' }}>
              12. Grievance Officer & Contact Information
            </h2>
            <p>
              In accordance with the Information Technology Act, 2000 and the Consumer Protection (E-Commerce) Rules, 2020, the details of the designated Grievance Officer are set forth below:
            </p>
            <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '12px', marginTop: '1rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.92rem' }}>
              <p><strong>Name:</strong> {siteConfig.grievanceOfficer.name}</p>
              <p><strong>Designation:</strong> {siteConfig.grievanceOfficer.designation}</p>
              <p>
                <strong>Email:</strong>{' '}
                <a href={`mailto:${siteConfig.grievanceOfficer.email}`} style={{ color: 'var(--primary-hover)', fontWeight: 600 }}>
                  {siteConfig.grievanceOfficer.email}
                </a>
              </p>
              <p>
                <strong>Phone:</strong>{' '}
                <a href={`tel:${siteConfig.grievanceOfficer.phone}`} style={{ color: 'var(--primary-hover)', fontWeight: 600 }}>
                  {siteConfig.grievanceOfficer.phone}
                </a>
              </p>
              <p><strong>Address:</strong> {siteConfig.grievanceOfficer.address}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

