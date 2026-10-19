import { Router } from 'express';
import {
  getShops,
  getShopById,
  createShop,
  toggleShopStatus,
} from '../controllers/shopController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.route('/')
  .get(getShops)
  .post(protect, authorize('admin', 'shopkeeper'), createShop);

router.route('/:id')
  .get(getShopById);

router.patch('/:id/toggle-status', protect, authorize('admin', 'shopkeeper'), toggleShopStatus);

export default router;

