export interface CouponRule {
  code: string;
  discountPercent: number;
  maxDiscount: number;
  minOrderValue: number;
  description: string;
}

export const siteConfig = {
  name: 'Onbuggy',
  legalEntity: 'Onbuggy Technologies Pvt. Ltd.',
  tagline: 'Hyperlocal Instant Essentials Delivery',
  city: 'Rewa, Madhya Pradesh',
  serviceableCity: 'Rewa',
  supportedPincodes: ['486001', '486002', '486003', '486005', '486006'],
  deliveryTimeText: '20–35 mins',
  avgDeliveryMins: 20,
  deliveryFee: 30,
  taxRatePercent: 5, // 5% GST
  gstTaxPercentage: 5,
  feedingIndiaDonationAmount: 10, // Flat ₹10 optional charity donation
  feedingIndiaDefaultDonation: 10,
  minOrderBudget: 50,
  maxOrderBudget: 50000,
  contactPhone: '+91 98261 12233',
  contactEmail: 'support@onbuggy.com',
  grievanceOfficer: {
    name: 'Aditya Tiwari',
    designation: 'Grievance Officer & Compliance Lead',
    email: 'grievance@onbuggy.com',
    phone: '+91 98261 12233',
    address: 'Onbuggy Technologies Pvt Ltd, Civil Lines, Rewa, MP 486001',
  },
  contact: {
    phone: '+91 98261 12233',
    phoneRaw: '+919826112233',
    whatsapp: 'https://wa.me/919826112233?text=Hi%20Onbuggy%20Support',
    email: 'support@onbuggy.com',
    address: 'Civil Lines, Rewa, Madhya Pradesh 486001',
    grievanceOfficer: {
      name: 'Aditya Tiwari',
      designation: 'Grievance Officer & Compliance Lead',
      email: 'grievance@onbuggy.com',
      phone: '+91 98261 12233',
      address: 'Onbuggy Technologies Pvt Ltd, Civil Lines, Rewa, MP 486001',
    },
  },
  social: {
    facebook: 'https://facebook.com/onbuggy',
    instagram: 'https://instagram.com/onbuggy',
    twitter: 'https://x.com/onbuggy',
  },
  coupons: [
    {
      code: 'FIRSTTIME',
      discountPercent: 50,
      maxDiscount: 150,
      minOrderValue: 200,
      description: '50% off up to ₹150 (min. order ₹200)',
    },
    {
      code: 'BAPPA20',
      discountPercent: 20,
      maxDiscount: 100,
      minOrderValue: 150,
      description: '20% off up to ₹100 (min. order ₹150)',
    },
  ] as CouponRule[],
};

export interface BillCalculation {
  subtotal: number;
  deliveryFee: number;
  taxAmount: number;
  charityAmount: number;
  discount: number;
  grandTotal: number;
  couponApplied?: CouponRule;
  couponError?: string;
}

export function calculateBill(
  subtotal: number,
  couponCode?: string,
  optInCharity = false
): BillCalculation {
  const deliveryFee = siteConfig.deliveryFee;
  const taxAmount = Math.round((subtotal * siteConfig.taxRatePercent) / 100);
  const charityAmount = optInCharity ? siteConfig.feedingIndiaDonationAmount : 0;

  let discount = 0;
  let couponApplied: CouponRule | undefined;
  let couponError: string | undefined;

  if (couponCode && couponCode.trim()) {
    const formatted = couponCode.trim().toUpperCase();
    const matched = siteConfig.coupons.find((c) => c.code === formatted);

    if (!matched) {
      couponError = `Invalid coupon code "${formatted}".`;
    } else if (subtotal < matched.minOrderValue) {
      couponError = `Code "${formatted}" requires a minimum order of ₹${matched.minOrderValue}.`;
    } else {
      discount = Math.min(
        Math.round((subtotal * matched.discountPercent) / 100),
        matched.maxDiscount
      );
      couponApplied = matched;
    }
  }

  const grandTotal = Math.max(0, subtotal + deliveryFee + taxAmount + charityAmount - discount);

  return {
    subtotal,
    deliveryFee,
    taxAmount,
    charityAmount,
    discount,
    grandTotal,
    couponApplied,
    couponError,
  };
}
