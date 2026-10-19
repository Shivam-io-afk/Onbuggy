import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
} from '../controllers/productController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.route('/')
  .get(getProducts)
  .post(protect, authorize('admin', 'shopkeeper'), createProduct);

router.route('/:id')
  .get(getProductById);

export default router;

