import { Router } from 'express';
import * as friendshipController from '../controllers/friendshipController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Friendship routes
router.get('/', friendshipController.getFriends);
router.get('/requests', friendshipController.getFriendRequests);
router.post('/request', friendshipController.sendFriendRequest);
router.post('/respond', friendshipController.respondToFriendRequest);
router.delete('/:friendshipId', friendshipController.removeFriend);

export default router; 