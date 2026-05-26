import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getCurrentSubscription,
  getSubscriptionHistory,
  cancelSubscription,
  getPlans
} from '../controllers/subscriptionController.js';

const router = express.Router();

router.use(protect);

router.get('/current', getCurrentSubscription);
router.get('/history', getSubscriptionHistory);
router.get('/plans', getPlans);
router.post('/cancel', cancelSubscription);

export default router;