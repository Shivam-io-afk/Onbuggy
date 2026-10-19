export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin' | 'shopkeeper' | 'delivery';
  shopId?: string;
  avatar?: string;
  address?: {
    street?: string;
    area?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
}

export interface Shop {
  _id: string;
  name: string;
  category: 'medicine' | 'grocery' | 'vegetable';
  categoryLabel: string;
  rating: number;
  reviewCount: number;
  deliveryTimeMin: number;
  distanceKm: number;
  isOpen: boolean;
  description: string;
  image: string;
  address: string;
  phone: string;
  lat?: number;
  lng?: number;
  featured?: boolean;
}

export interface Product {
  _id: string;
  shopId: string;
  name: string;
  category: 'medicine' | 'grocery' | 'vegetable';
  price: number;
  originalPrice?: number;
  unit: string;
  image: string;
  description?: string;
  inStock: boolean;
}

export interface OrderItem {
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  image?: string;
}

export type OrderStatus = 'Order Placed' | 'Processing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface DeliveryLocation {
  lat: number;
  lng: number;
  heading?: number;
  speed?: number; // km/h
  lastUpdated?: string;
  statusText?: string;
  batteryLevel?: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId?: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
  customerName?: string;
  customerPhone?: string;
  shopId?: string;
  shopName: string;
  shopLocation?: { lat: number; lng: number };
  category?: 'medicine' | 'grocery' | 'vegetable' | string;
  deliveryAddress: string;
  destinationLocation?: { lat: number; lng: number };
  items: OrderItem[];
  prescriptionImageUrl?: string;
  prescriptionUrl?: string;
  subtotal: number;
  deliveryFee: number;
  taxAmount?: number;
  charityAmount?: number;
  donationGstFee: number;
  couponCode?: string;
  discount: number;
  grandTotal: number;
  paymentMethod: 'Debit Card' | 'Credit Card' | 'Wallet' | 'Pay-on-Delivery (COD)';
  walletProvider?: string;
  isPaid: boolean;
  status: OrderStatus;
  deliveryPersonnel: string;
  deliveryLocation?: DeliveryLocation;
  statusHistory: OrderStatusHistory[];
  estimatedDeliveryTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantStats {
  shop: Shop;
  storeRevenue: number;
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalProducts: number;
  inStockProducts: number;
}


