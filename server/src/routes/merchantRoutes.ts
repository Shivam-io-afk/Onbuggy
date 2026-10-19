import { Router } from 'express';
import {
  getMerchantStats,
  getMerchantOrders,
  updateMerchantOrderStatus,
  getMerchantProducts,
  toggleProductStock,
  toggleMerchantStoreStatus,
} from '../controllers/merchantController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Protect all merchant routes for shopkeeper and admin roles
router.use(protect);
router.use(authorize('shopkeeper', 'admin'));

router.get('/stats', getMerchantStats);
router.get('/orders', getMerchantOrders);
router.patch('/orders/:id/status', updateMerchantOrderStatus);
router.get('/products', getMerchantProducts);
router.patch('/products/:id/toggle-stock', toggleProductStock);
router.patch('/store/toggle-status', toggleMerchantStoreStatus);

export default router;

