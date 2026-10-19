import { io, Socket } from 'socket.io-client';
import { Order, DeliveryLocation, Shop, Product, PaymentDetails } from '../types';

let socket: Socket | null = null;

// Determine socket URL based on environment or window location
const getSocketUrl = (): string => {
  // If explicitly configured for production e.g. https://onbuggy-server.onrender.com
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  // If VITE_API_URL is provided, extract its origin domain
  if (import.meta.env.VITE_API_URL) {
    try {
      const parsed = new URL(import.meta.env.VITE_API_URL);
      return parsed.origin;
    } catch (e) {
      // ignore
    }
  }
  if (typeof window !== 'undefined') {
    // In dev Vite proxy runs on 5173, backend on 5000
    if (window.location.port === '5173') {
      return 'http://localhost:5000';
    }
    return window.location.origin;
  }
  return 'http://localhost:5000';
};

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(getSocketUrl(), {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      console.log(`[WebSocket Client]: Connected to server (${socket?.id})`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[WebSocket Client]: Disconnected (${reason})`);
    });

    socket.on('connect_error', (error) => {
      console.warn('[WebSocket Client]: Connection error:', error.message);
    });
  }

  return socket;
};

// Join tracking room for a specific order
export const joinOrderRoom = (orderId: string) => {
  const s = getSocket();
  s.emit('join:order', orderId);
};

export const leaveOrderRoom = (orderId: string) => {
  const s = getSocket();
  s.emit('leave:order', orderId);
};

// Join role-specific room (e.g. 'admin', 'delivery', 'shopkeeper')
export const joinRoleRoom = (role: 'admin' | 'delivery' | 'shopkeeper' | 'customer', identifier?: string) => {
  const s = getSocket();
  s.emit('join:role', { role, identifier });
};

// Delivery Boy broadcasts live GPS coordinates
export const broadcastRiderLocation = (payload: {
  orderId: string;
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
  batteryLevel?: number;
  statusText?: string;
}) => {
  const s = getSocket();
  s.emit('rider:location_broadcast', payload);
};

// Event Listeners
export const subscribeToOrderUpdates = (callback: (data: { order: Order }) => void) => {
  const s = getSocket();
  s.on('order:status_updated', callback);
  return () => {
    s.off('order:status_updated', callback);
  };
};

export const subscribeToLocationUpdates = (
  callback: (data: { orderId: string; deliveryLocation: DeliveryLocation }) => void
) => {
  const s = getSocket();
  s.on('delivery:location_updated', callback);
  return () => {
    s.off('delivery:location_updated', callback);
  };
};

export const subscribeToNewOrders = (callback: (data: { order: Order }) => void) => {
  const s = getSocket();
  s.on('order:new', callback);
  s.on('merchant:new_order', callback);
  s.on('order:new_dispatch', callback);
  return () => {
    s.off('order:new', callback);
    s.off('merchant:new_order', callback);
    s.off('order:new_dispatch', callback);
  };
};

export const subscribeToShopStatus = (callback: (data: { shop: Shop }) => void) => {
  const s = getSocket();
  s.on('shop:status_toggled', callback);
  return () => {
    s.off('shop:status_toggled', callback);
  };
};

export const subscribeToProductStock = (callback: (data: { product: Product }) => void) => {
  const s = getSocket();
  s.on('product:stock_toggled', callback);
  return () => {
    s.off('product:stock_toggled', callback);
  };
};

export const subscribeToPaymentCollected = (
  callback: (data: { order: Order; paymentDetails?: PaymentDetails }) => void
) => {
  const s = getSocket();
  s.on('order:payment_collected', callback);
  return () => {
    s.off('order:payment_collected', callback);
  };
};

export const subscribeToPlatformBroadcast = (
  callback: (data: { title: string; message: string; type: 'info' | 'warning' | 'emergency'; timestamp: string }) => void
) => {
  const s = getSocket();
  s.on('platform:broadcast_alert', callback);
  return () => {
    s.off('platform:broadcast_alert', callback);
  };
};



