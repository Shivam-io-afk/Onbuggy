import React, { useState } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig } from '../config/site';

interface FAQItem {
  question: string;
  answer: string;
  category: 'delivery' | 'prescriptions' | 'payments' | 'general';
}

const FAQS: FAQItem[] = [
  {
    category: 'delivery',
    question: `How fast does Onbuggy deliver in ${siteConfig.serviceableCity}?`,
    answer: `Our average delivery turnaround is ${siteConfig.avgDeliveryMins} minutes. During peak traffic or bad weather, deliveries may take up to 35 minutes. You can track your assigned rider live in the My Orders tab.`,
  },
  {
    category: 'prescriptions',
    question: 'How do I order medicines using a doctor prescription?',
    answer: 'Simply click "Upload Prescription / Slip" on the home page or checkout page. Take a clear photo of your prescription (.png, .jpg, or .webp under 1.5MB). A licensed neighborhood pharmacist verifies the prescribed medicines, calculates the exact bill, and dispatches them in sealed tamper-proof packaging.',
  },
  {
    category: 'prescriptions',
    question: 'Can I order Schedule H or Schedule X drugs without a prescription?',
    answer: 'No. In strict compliance with the Drugs and Cosmetics Act of India, Schedule H and X prescription medications will only be dispensed after a valid, signed prescription from a registered medical practitioner is uploaded and verified.',
  },
  {
    category: 'payments',
    question: 'What payment modes are accepted?',
    answer: 'Currently, Cash on Delivery (Pay on Delivery / COD) is our primary active payment mode. We are currently rolling out UPI and Card payments with leading payment gateways.',
  },
  {
    category: 'payments',
    question: 'How do discount coupons work?',
    answer: `You can use coupon code FIRSTTIME to get 50% off (up to ₹150 on orders above ₹200) on your first purchase, or BAPPA20 for 20% off (up to ₹100 on orders above ₹150). Enter the code in the checkout coupon box and click Apply.`,
  },
  {
    category: 'general',
    question: 'What is the "Feeding India" optional donation on checkout?',
    answer: `It is an optional, opt-in ₹${siteConfig.feedingIndiaDonationAmount} micro-donation that directly supports community food drives and emergency meal kits across India. It is completely voluntary and unchecked by default.`,
  },
  {
    category: 'general',
    question: 'How can I register my pharmacy, grocery store, or farm mandi?',
    answer: 'We love partnering with neighborhood stores! Contact us through the Contact Us page or email support@onbuggy.com with your store name, license details, and address to get onboarded within 24 hours.',
  },
];

export const FAQPage: React.FC = () => {
  useDocumentTitle('Frequently Asked Questions (FAQ)', 'Common questions about deliveries, prescriptions, and payments on Onbuggy.');
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem 5rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ width: '54px', height: '54px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
          <HelpCircle size={28} />
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--dark)', fontFamily: 'var(--font-brand)' }}>
          Frequently Asked Questions
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '6px' }}>
          Quick answers about ordering, prescriptions, fast deliveries, and store partners.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3.5rem' }}>
        {FAQS.map((faq, i) => {
          const isOpen = openIdx === i;
          return (
            <div
              key={i}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
                transition: 'border-color 0.2s',
              }}
            >
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'transparent',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  color: isOpen ? 'var(--primary-hover)' : 'var(--dark)',
                }}
              >
                <span>{faq.question}</span>
                <ChevronDown
                  size={18}
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s ease',
                    color: '#64748b',
                    flexShrink: 0,
                    marginLeft: '12px',
                  }}
                />
              </button>

              {isOpen && (
                <div style={{ padding: '0 1.5rem 1.25rem 1.5rem', color: '#475569', fontSize: '0.95rem', lineHeight: 1.65 }}>
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ backgroundColor: '#f8fafc', borderRadius: '20px', padding: '2rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '6px' }}>
          Still have questions?
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '1.25rem' }}>
          Our customer support team is available 24/7 to help resolve your queries.
        </p>
        <Link
          to="/contact-us"
          style={{
            backgroundColor: 'var(--primary)',
            color: '#064e3b',
            fontWeight: 700,
            padding: '10px 22px',
            borderRadius: '10px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.92rem',
          }}
        >
          Contact Support <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

