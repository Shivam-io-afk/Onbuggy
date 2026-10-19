import axios from 'axios';
import { Shop, Product, Order, User, MerchantStats, DeliveryLocation } from '../types';

const getBaseUrl = (): string => {
  // When deployed on Vercel, points to Render URL e.g. https://onbuggy-server.onrender.com/api
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // In development Vite proxies /api to http://localhost:5000/api
  return '/api';
};

export interface NetworkTrafficState {
  activeCount: number;
  isLoading: boolean;
  isSlowRequest: boolean;
  isServerWaking: boolean;
  isOnline: boolean;
}

type TrafficListener = (state: NetworkTrafficState) => void;
const listeners: Set<TrafficListener> = new Set();

let activeRequests = 0;
let slowRequestTimer: any = null;
let isSlow = false;

const notifyListeners = () => {
  const state: NetworkTrafficState = {
    activeCount: activeRequests,
    isLoading: activeRequests > 0,
    isSlowRequest: isSlow,
    isServerWaking: isSlow,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  };
  listeners.forEach((listener) => {
    try {
      listener(state);
    } catch {
      // ignore
    }
  });
};

export const subscribeToNetworkTraffic = (listener: TrafficListener) => {
  listeners.add(listener);
  listener({
    activeCount: activeRequests,
    isLoading: activeRequests > 0,
    isSlowRequest: isSlow,
    isServerWaking: isSlow,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  });
  return () => {
    listeners.delete(listener);
  };
};

const handleRequestStart = () => {
  activeRequests++;
  if (activeRequests === 1) {
    if (slowRequestTimer) clearTimeout(slowRequestTimer);
    slowRequestTimer = setTimeout(() => {
      if (activeRequests > 0) {
        isSlow = true;
        notifyListeners();
      }
    }, 2400); // 2.4s threshold flags server waking / high traffic
  }
  notifyListeners();
};

const handleRequestEnd = () => {
  activeRequests = Math.max(0, activeRequests - 1);
  if (activeRequests === 0) {
    if (slowRequestTimer) {
      clearTimeout(slowRequestTimer);
      slowRequestTimer = null;
    }
    isSlow = false;
  }
  notifyListeners();
};

const API = axios.create({
  baseURL: getBaseUrl(),
  timeout: 45000, // 45 seconds for Render cloud cold-starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Bearer token and track active traffic
API.interceptors.request.use(
  (config) => {
    handleRequestStart();
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    handleRequestEnd();
    return Promise.reject(error);
  }
);

// Response interceptor with auto-retry on 502/503/504 Render cold starts
API.interceptors.response.use(
  (response) => {
    handleRequestEnd();
    return response;
  },
  async (error) => {
    handleRequestEnd();

    const config = error.config as any;
    if (config && (!config.__retryCount || config.__retryCount < 2)) {
      const status = error.response?.status;
      const isRetryable =
        !status ||
        status === 502 ||
        status === 503 ||
        status === 504 ||
        error.code === 'ECONNABORTED';

      if (isRetryable && (config.method === 'get' || !config.method)) {
        config.__retryCount = (config.__retryCount || 0) + 1;
        const delay = config.__retryCount * 1200;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return API(config);
      }
    }

    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  register: (data: any) => API.post<{ success: boolean; token: string; user: User }>('/auth/register', data),
  login: (data: any) => API.post<{ success: boolean; token: string; user: User }>('/auth/login', data),
  getMe: () => API.get<{ success: boolean; user: User; stats: { totalOrders: number } }>('/auth/me'),
  updateProfile: (data: any) => API.put<{ success: boolean; user: User; message: string }>('/auth/profile', data),
  sendOtp: (email: string) => API.post<{ success: boolean; message: string; demoOtpHint: string }>('/auth/send-otp', { email }),
  verifyOtp: (email: string, otp: string) => API.post<{ success: boolean; message: string; verified: boolean }>('/auth/verify-otp', { email, otp }),
};

// Shop Services
export const shopService = {
  getShops: (params?: {
    category?: string;
    search?: string;
    sortBy?: string;
    isOpen?: boolean;
    userLat?: number;
    userLng?: number;
    location?: string;
  }) => API.get<{ success: boolean; count: number; data: Shop[] }>('/shops', { params }),
  getShopById: (id: string) =>
    API.get<{ success: boolean; data: Shop; products: Product[] }>(`/shops/${id}`),
};

// Product Services
export const productService = {
  getProducts: (params?: { shopId?: string; category?: string; search?: string }) =>
    API.get<{ success: boolean; count: number; data: Product[] }>('/products', { params }),
};

// Order Services
export const orderService = {
  uploadPrescription: (file: File) => {
    const formData = new FormData();
    formData.append('prescription', file);
    return API.post<{ success: boolean; message: string; imageUrl: string; fileName: string; fileSize: number }>(
      '/orders/upload-prescription',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },
  createOrder: (orderData: any) => API.post<{ success: boolean; message: string; data: Order }>('/orders', orderData),
  getMyOrders: (params?: { email?: string; phone?: string }) =>
    API.get<{ success: boolean; count: number; data: Order[] }>('/orders/my-orders', { params }),
  getOrderById: (id: string) => API.get<{ success: boolean; data: Order }>(`/orders/${id}`),
  advanceOrderStatus: (id: string) =>
    API.patch<{ success: boolean; message: string; data: Order }>(`/orders/${id}/advance-status`),
  cancelOrder: (id: string) => API.patch<{ success: boolean; message: string; data: Order }>(`/orders/${id}/cancel`),
};

// Contact Service
export const contactService = {
  submitMessage: (data: { name: string; email: string; topic: string; message: string }) =>
    API.post<{ success: boolean; message: string }>('/contact', data),
};

// Admin Services
export const adminService = {
  getStats: () =>
    API.get<{
      success: boolean;
      data: {
        totalOrders: number;
        activeOrders: number;
        deliveredOrders: number;
        cancelledOrders: number;
        totalRevenue: number;
        totalStores: number;
        openStores: number;
        totalUsers: number;
        totalCustomers: number;
        totalRiders: number;
        recentOrders: Order[];
      };
    }>('/admin/stats'),
  getOrders: (params?: { status?: string; search?: string; shopId?: string }) =>
    API.get<{ success: boolean; count: number; data: Order[] }>('/admin/orders', { params }),
  updateOrderStatus: (id: string, data: { status?: string; deliveryPersonnel?: string; isPaid?: boolean }) =>
    API.patch<{ success: boolean; message: string; data: Order }>(`/admin/orders/${id}/status`, data),
  getShops: () =>
    API.get<{ success: boolean; count: number; data: Shop[] }>('/admin/shops'),
  toggleShopStatus: (id: string) =>
    API.patch<{ success: boolean; message: string; data: Shop }>(`/admin/shops/${id}/toggle-status`),
  getUsers: () =>
    API.get<{ success: boolean; count: number; data: User[] }>('/admin/users'),
  updateUserRole: (id: string, role: string) =>
    API.patch<{ success: boolean; message: string; data: User }>(`/admin/users/${id}/role`, { role }),
  getFinancials: () =>
    API.get<{
      success: boolean;
      data: {
        grossRevenue: number;
        totalCashCollected: number;
        totalUpiCollected: number;
        totalPrepaidCollected: number;
        totalTaxesCollected: number;
        totalCharityCollected: number;
        riderLedger: Array<{
          riderName: string;
          completedCount: number;
          cashCollected: number;
          upiCollected: number;
          lastActive: string;
        }>;
      };
    }>('/admin/financials'),
  createShop: (shopData: Partial<Shop>) =>
    API.post<{ success: boolean; message: string; data: Shop }>('/admin/shops', shopData),
  deleteShop: (id: string) =>
    API.delete<{ success: boolean; message: string }>(`/admin/shops/${id}`),
  broadcastAlert: (alertData: { title?: string; message: string; type?: 'info' | 'warning' | 'emergency' }) =>
    API.post<{ success: boolean; message: string; data: any }>('/admin/broadcast', alertData),
};

// Delivery Services
export const deliveryService = {
  getStats: () =>
    API.get<{
      success: boolean;
      data: {
        riderName: string;
        activeTrips: number;
        completedTrips: number;
        cashCollected: number;
        upiCollected?: number;
        totalCollected?: number;
        earnedPayout: number;
      };
    }>('/delivery/stats'),
  getOrders: (params?: { filter?: 'active' | 'delivered' | 'all' }) =>
    API.get<{ success: boolean; count: number; data: Order[] }>('/delivery/orders', { params }),
  updateStatus: (
    id: string,
    data: {
      status: 'Out for Delivery' | 'Delivered';
      note?: string;
      deliveryOtp?: string;
      paymentData?: {
        method?: 'UPI_QR' | 'CASH' | 'ONLINE_PREPAID' | 'PAYMENT_LINK';
        amount?: number;
        cashTendered?: number;
        changeReturned?: number;
        upiTransactionRef?: string;
        note?: string;
      };
    }
  ) =>
    API.patch<{ success: boolean; message: string; data: Order }>(`/delivery/orders/${id}/status`, data),
  collectPayment: (
    id: string,
    data: {
      paymentMethod: 'UPI_QR' | 'CASH' | 'ONLINE_PREPAID' | 'PAYMENT_LINK';
      amount: number;
      cashTendered?: number;
      changeReturned?: number;
      upiTransactionRef?: string;
      deliveryOtp?: string;
      note?: string;
    }
  ) =>
    API.post<{ success: boolean; message: string; data: Order }>(`/delivery/orders/${id}/collect-payment`, data),
  updateLocation: (
    id: string,
    data: { lat: number; lng: number; speed?: number; heading?: number; statusText?: string; batteryLevel?: number }
  ) =>
    API.patch<{ success: boolean; message: string; data: DeliveryLocation }>(`/delivery/orders/${id}/location`, data),
  simulateStep: (id: string) =>
    API.post<{
      success: boolean;
      data: {
        orderId: string;
        deliveryLocation: DeliveryLocation;
        shopLocation: { lat: number; lng: number };
        destinationLocation: { lat: number; lng: number };
      };
    }>(`/delivery/orders/${id}/simulate-step`),
};

// Merchant Services
export const merchantService = {
  getStats: () =>
    API.get<{ success: boolean; data: MerchantStats }>('/merchant/stats'),
  getOrders: (params?: { status?: string }) =>
    API.get<{ success: boolean; count: number; data: Order[] }>('/merchant/orders', { params }),
  updateOrderStatus: (id: string, data: { status: string; note?: string }) =>
    API.patch<{ success: boolean; message: string; data: Order }>(`/merchant/orders/${id}/status`, data),
  getProducts: () =>
    API.get<{ success: boolean; count: number; data: Product[] }>('/merchant/products'),
  toggleStock: (id: string) =>
    API.patch<{ success: boolean; message: string; data: Product }>(`/merchant/products/${id}/toggle-stock`),
  toggleStoreStatus: () =>
    API.patch<{ success: boolean; message: string; data: Shop }>('/merchant/store/toggle-status'),
};

export default API;

