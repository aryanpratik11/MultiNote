import { Router } from 'express';
import { login, getMe } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const authRoutes = Router();

authRoutes.post('/login', login);
authRoutes.get('/me', authenticateToken, getMe);

export default authRoutes;