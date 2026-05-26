import express from 'express';
import { protect } from '../middleware/auth.js';
import { getAnalytics, getDashboardSummary } from '../controllers/analyticsController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', getAnalytics);
router.get('/dashboard', getDashboardSummary);

export default router;