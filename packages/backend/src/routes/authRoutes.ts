import { Router } from 'express';
import * as authController from '../controllers/authController';

const router = Router();

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);

export default router; 