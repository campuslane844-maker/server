import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateBody } from '../middleware/validation';
import { adminLoginSchema } from '../validators/auth';
import { authLimiter } from '../middleware/rateLimit';
import { optionalAuth } from '../middleware/auth';

const router = Router();


router.post('/google', authLimiter, AuthController.googleSignIn);

router.post('/admin/login', authLimiter, validateBody(adminLoginSchema), AuthController.adminLogin);

router.get("/me", optionalAuth, AuthController.getMe);
export default router;