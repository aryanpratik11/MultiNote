import { Router } from 'express';
import { upgradeTenant } from '../controllers/tenantController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const tenantRoutes = Router();

tenantRoutes.post('/:slug/upgrade', authenticateToken, requireAdmin, upgradeTenant);

export default tenantRoutes;
