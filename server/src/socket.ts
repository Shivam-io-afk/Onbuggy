import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server | null = null;

export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[WebSocket]: Client connected (${socket.id})`);

    // Join order-specific tracking room
    socket.on('join:order', (orderId: string) => {
      if (orderId) {
        socket.join(`order:${orderId}`);
        console.log(`[WebSocket]: Socket ${socket.id} joined room order:${orderId}`);
      }
    });

    socket.on('leave:order', (orderId: string) => {
      if (orderId) {
        socket.leave(`order:${orderId}`);
        console.log(`[WebSocket]: Socket ${socket.id} left room order:${orderId}`);
      }
    });

    // Join role-specific rooms (admin, merchant, delivery)
    socket.on('join:role', (data: { role: string; identifier?: string }) => {
      const { role, identifier } = data;
      if (role === 'admin') {
        socket.join('role:admin');
        console.log(`[WebSocket]: Socket ${socket.id} joined role:admin`);
      } else if (role === 'delivery') {
        socket.join('role:delivery');
        console.log(`[WebSocket]: Socket ${socket.id} joined role:delivery`);
      } else if (role === 'shopkeeper' || role === 'merchant') {
        socket.join('role:merchant');
        if (identifier) {
          socket.join(`merchant:${identifier}`);
        }
        console.log(`[WebSocket]: Socket ${socket.id} joined role:merchant (${identifier || 'all'})`);
      }
    });

    // Live Rider GPS Broadcast from Delivery App
    socket.on('rider:location_broadcast', (payload: {
      orderId: string;
      lat: number;
      lng: number;
      speed?: number;
      heading?: number;
      batteryLevel?: number;
      statusText?: string;
    }) => {
      if (payload && payload.orderId) {
        const updateData = {
          orderId: payload.orderId,
          deliveryLocation: {
            lat: payload.lat,
            lng: payload.lng,
            speed: payload.speed ?? 25,
            heading: payload.heading ?? 0,
            batteryLevel: payload.batteryLevel ?? 85,
            statusText: payload.statusText || 'Rider en route in Rewa',
            lastUpdated: new Date().toISOString(),
          },
        };

        // Broadcast to customer and merchant in the order room
        socket.to(`order:${payload.orderId}`).emit('delivery:location_updated', updateData);
        // Also broadcast to admin room
        io?.to('role:admin').emit('delivery:location_updated', updateData);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[WebSocket]: Client disconnected (${socket.id})`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io has not been initialized yet!');
  }
  return io;
};

// Global broadcast helpers
export const emitOrderPlaced = (order: any) => {
  if (!io) return;
  // Notify admin
  io.to('role:admin').emit('order:new', { order });
  // Notify delivery fleet
  io.to('role:delivery').emit('order:new_dispatch', { order });
  // Notify merchant store
  if (order.shopName) {
    io.to(`merchant:${order.shopName}`).emit('merchant:new_order', { order });
  }
  io.to('role:merchant').emit('merchant:new_order', { order });
};

export const emitOrderStatusUpdated = (order: any) => {
  if (!io) return;
  // Broadcast to order room (customer, merchant, rider)
  io.to(`order:${order._id}`).emit('order:status_updated', { order });
  // Broadcast to admin room
  io.to('role:admin').emit('order:status_updated', { order });
  // Broadcast to merchant room
  io.to('role:merchant').emit('order:status_updated', { order });
  if (order.shopName) {
    io.to(`merchant:${order.shopName}`).emit('order:status_updated', { order });
  }
  // Broadcast to delivery room
  io.to('role:delivery').emit('order:status_updated', { order });
};

export const emitDeliveryLocation = (orderId: string, deliveryLocation: any) => {
  if (!io) return;
  io.to(`order:${orderId}`).emit('delivery:location_updated', {
    orderId,
    deliveryLocation,
  });
  io.to('role:admin').emit('delivery:location_updated', {
    orderId,
    deliveryLocation,
  });
  io.to('role:merchant').emit('delivery:location_updated', {
    orderId,
    deliveryLocation,
  });
};

export const emitShopStatusChanged = (shop: any) => {
  if (!io) return;
  io.emit('shop:status_toggled', { shop });
};

export const emitProductStockChanged = (product: any) => {
  if (!io) return;
  io.emit('product:stock_toggled', { product });
};

