import { Router } from 'express';
import {
  getDeliveryStats,
  getDeliveryOrders,
  updateDeliveryStatus,
  updateDeliveryLocation,
  simulateDeliveryStep,
  collectDeliveryPayment,
} from '../controllers/deliveryController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Delivery routes: accessible by riders and admins
router.get('/stats', protect, authorize('delivery', 'admin'), getDeliveryStats);
router.get('/orders', protect, authorize('delivery', 'admin'), getDeliveryOrders);
router.patch('/orders/:id/status', protect, authorize('delivery', 'admin'), updateDeliveryStatus);
router.post('/orders/:id/collect-payment', protect, authorize('delivery', 'admin'), collectDeliveryPayment);
router.patch('/orders/:id/location', protect, authorize('delivery', 'admin'), updateDeliveryLocation);
router.post('/orders/:id/simulate-step', simulateDeliveryStep);

export default router;


