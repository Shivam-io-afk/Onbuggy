import express, { Application, Request, Response } from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import { initSocket } from './socket';
import { startKeepAlive } from './utils/keepAlive';

import authRoutes from './routes/authRoutes';
import shopRoutes from './routes/shopRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import contactRoutes from './routes/contactRoutes';
import adminRoutes from './routes/adminRoutes';
import deliveryRoutes from './routes/deliveryRoutes';
import merchantRoutes from './routes/merchantRoutes';

import { initServerLogger, isLogsEnabled } from './utils/logger';

// Load env vars
dotenv.config();

// Initialize configurable logger (mutes terminal when ENABLE_LOGS=false)
initServerLogger();

// Connect to Database
connectDB();

const app: Application = express();

// Security & Utility Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));

// Dynamic CORS configuration allowing localhost and all Vercel domains
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development' && isLogsEnabled()) {
  app.use(morgan('dev'));
}

// Static directories
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// Also serve existing resorces folder from root if requested through API
app.use('/resorces', express.static(path.join(__dirname, '../../resorces')));

// Root & API Welcome Endpoints
app.get(['/', '/api'], (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    name: 'Onbuggy Hyperlocal Delivery API',
    version: '2.0.0',
    status: 'online',
    endpoints: {
      health: '/api/health',
      shops: '/api/shops',
      products: '/api/products',
      orders: '/api/orders',
      myOrders: '/api/orders/my-orders',
      admin: '/api/admin',
      delivery: '/api/delivery',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        profile: 'PUT /api/auth/profile',
      },
      contact: 'POST /api/contact',
    },
    documentation: 'See API_DOCUMENTATION.md in project root',
  });
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'Onbuggy Delivery API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/merchant', merchantRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found`,
  });
});

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Create HTTP Server & Initialize Real-Time WebSocket Engine
const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`[Onbuggy Server] running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT} (WebSocket Ready)`);
  // Start Render anti-sleep keep-alive engine
  startKeepAlive();
});

export default app;

