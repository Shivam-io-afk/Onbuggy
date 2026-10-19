import React from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ShieldCheck, Lock, FileText, Mail, Phone, MapPin } from 'lucide-react';
import { siteConfig } from '../config/site';

export const PrivacyPolicyPage: React.FC = () => {
  useDocumentTitle('Privacy Policy', 'Onbuggy Privacy Policy compliant with India DPDP Act 2023.');

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 1.5rem 5rem 1.5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '9999px', backgroundColor: '#ecfdf5', color: '#047857', fontWeight: 700, fontSize: '0.85rem', marginBottom: '1rem' }}>
          <ShieldCheck size={16} /> Compliant with India DPDP Act 2023
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--dark)', fontFamily: 'var(--font-brand)' }}>
          Privacy Policy
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Effective Date: January 1, 2026 • Last Revised: October 2026
        </p>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '2.5rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)', lineHeight: 1.7, color: '#334155' }}>
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '0.75rem' }}>
            1. Overview & Commitment
          </h2>
          <p>
            At <strong>Onbuggy Technologies Pvt. Ltd.</strong> ("Onbuggy", "we", "our", or "us"), we value your trust and are committed to protecting the personal data of customers who use our hyperlocal delivery platform. This Privacy Policy details what personal data we collect, why we collect it, how it is processed, and your statutory rights under the <em>Digital Personal Data Protection Act, 2023 (India)</em>.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '0.75rem' }}>
            2. Personal Data We Collect
          </h2>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>Identity & Contact Information:</strong> Name, 10-digit Indian phone number, and email address.</li>
            <li><strong>Delivery Location Data:</strong> Street address, flat/house number, landmark, area pincode, and optional device GPS coordinates provided with your permission.</li>
            <li><strong>Prescription & Medical Records:</strong> Photos of handwritten prescriptions or OTC drug order slips uploaded to facilitate fulfillment by licensed local pharmacists under Schedule H/X rules.</li>
            <li><strong>Transaction & Order Logs:</strong> Ordered items, billing breakdown, payment mode (COD, Cards, UPI), and delivery status histories.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '0.75rem' }}>
            3. Purpose of Processing
          </h2>
          <p>We process your personal data exclusively for:</p>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>Transmitting order slips and prescriptions to registered neighborhood pharmacies and grocery stores.</li>
            <li>Enabling delivery riders to navigate to your exact doorstep within 20–35 minutes.</li>
            <li>Sending critical transactional updates via SMS and live in-app notifications.</li>
            <li>Complying with statutory drug dispensing regulations and taxation laws.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '0.75rem' }}>
            4. Prescription Handling & Data Retention
          </h2>
          <p>
            Prescription images are strictly shared with the dispensing licensed pharmacist fulfilling your order. We retain order records for the duration required by applicable pharmaceutical and accounting regulations (typically 3 years), after which they are securely scrubbed or anonymized.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '0.75rem' }}>
            5. Data Sharing with Third Parties
          </h2>
          <p>
            We <strong>never sell or rent your personal data</strong>. Data is only shared with:
          </p>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li><strong>Fulfilling Merchants:</strong> To assemble and verify prescribed drugs and groceries.</li>
            <li><strong>Assigned Delivery Personnel:</strong> Recipient name, phone number, and address strictly for completing delivery.</li>
            <li><strong>Law Enforcement:</strong> Solely upon receipt of a lawful order or subpoena.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '0.75rem' }}>
            6. Your Legal Rights
          </h2>
          <p>Under the DPDP Act 2023, you have the right to:</p>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>Access a summary of your personal data processed by Onbuggy.</li>
            <li>Correct inaccurate or incomplete profile and address records.</li>
            <li>Request erasure of your personal data when no longer needed for regulatory compliance.</li>
            <li>Nominate an individual to exercise rights on your behalf in the event of incapacity.</li>
          </ul>
        </section>

        <section style={{ backgroundColor: '#f8fafc', padding: '1.75rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '0.75rem' }}>
            7. Grievance Officer & Contact
          </h2>
          <p style={{ marginBottom: '1rem', fontSize: '0.92rem' }}>
            If you have any questions, grievances, or requests regarding your personal data, please contact our designated Grievance Officer:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.92rem' }}>
            <p><strong>Name:</strong> {siteConfig.contact.grievanceOfficer.name}</p>
            <p><strong>Email:</strong> <a href={`mailto:${siteConfig.contact.grievanceOfficer.email}`} style={{ color: 'var(--primary-hover)', fontWeight: 600 }}>{siteConfig.contact.grievanceOfficer.email}</a></p>
            <p><strong>Phone:</strong> {siteConfig.contact.grievanceOfficer.phone}</p>
            <p><strong>Address:</strong> {siteConfig.contact.grievanceOfficer.address}</p>
          </div>
        </section>
      </div>
    </div>
  );
};

