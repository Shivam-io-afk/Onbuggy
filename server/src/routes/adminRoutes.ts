import { Router } from 'express';
import {
  getAdminStats,
  getAdminOrders,
  updateAdminOrderStatus,
  getAdminShops,
  toggleAdminShopStatus,
  getAdminUsers,
  updateAdminUserRole,
  getAdminFinancials,
  createAdminShop,
  deleteAdminShop,
  broadcastPlatformAlert,
} from '../controllers/adminController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Secure admin routes with protect & authorize('admin')
router.get('/stats', protect, authorize('admin'), getAdminStats);
router.get('/orders', protect, authorize('admin'), getAdminOrders);
router.patch('/orders/:id/status', protect, authorize('admin'), updateAdminOrderStatus);
router.get('/shops', protect, authorize('admin'), getAdminShops);
router.post('/shops', protect, authorize('admin'), createAdminShop);
router.delete('/shops/:id', protect, authorize('admin'), deleteAdminShop);
router.patch('/shops/:id/toggle-status', protect, authorize('admin'), toggleAdminShopStatus);
router.get('/users', protect, authorize('admin'), getAdminUsers);
router.patch('/users/:id/role', protect, authorize('admin'), updateAdminUserRole);
router.get('/financials', protect, authorize('admin'), getAdminFinancials);
router.post('/broadcast', protect, authorize('admin'), broadcastPlatformAlert);

export default router;


