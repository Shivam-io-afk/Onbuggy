import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  sendOtp,
  verifyOtp,
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

export default router;

