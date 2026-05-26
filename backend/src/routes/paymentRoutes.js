import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  initiateSubscription,
  mpesaCallback,
  checkPaymentStatus
} from '../controllers/paymentController.js';

const router = express.Router();

// Public callback endpoint for M-Pesa
router.post('/mpesa-callback', mpesaCallback);

// Protected routes
router.use(protect);
router.post('/subscribe', initiateSubscription);
router.get('/status/:paymentId', checkPaymentStatus);

export default router;