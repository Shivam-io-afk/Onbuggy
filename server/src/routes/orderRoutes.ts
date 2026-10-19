import { Router } from 'express';
import {
  createOrder,
  uploadPrescriptionImage,
  getMyOrders,
  getOrderById,
  advanceOrderStatus,
  cancelOrder,
} from '../controllers/orderController';
import { optionalAuth } from '../middleware/auth';
import { uploadPrescription } from '../middleware/upload';

const router = Router();

router.post('/upload-prescription', uploadPrescription.single('prescription'), uploadPrescriptionImage);
router.route('/')
  .post(optionalAuth, createOrder);

router.get('/my-orders', optionalAuth, getMyOrders);
router.get('/:id', getOrderById);
router.patch('/:id/advance-status', advanceOrderStatus);
router.patch('/:id/cancel', cancelOrder);

export default router;

