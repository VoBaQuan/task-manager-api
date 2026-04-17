import { Router } from 'express';
import { register, login, getMe, updateProfile, updateAvatar } from '../controllers/authController';
import { uploadAvatar } from '../middleware/upload';
import { protect } from '../middleware/auth';

// ===== PHASE 2: Auth Routes =====

const router = Router();

// Public routes - không cần token
router.post('/register', register);
router.post('/login', login);

// Protected routes - phải có token hợp lệ
// protect chạy trước, nếu token sai sẽ dừng ở đó
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.post('/me/avatar', protect, uploadAvatar, updateAvatar);

export default router;
