import { Router } from 'express';
import * as duoController from '../controllers/duoController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Duo routes
router.post('/', duoController.createDuo);
router.get('/', duoController.getUserDuos);
router.get('/:id', duoController.getDuo);
router.put('/:id', duoController.updateDuo);

export default router; 