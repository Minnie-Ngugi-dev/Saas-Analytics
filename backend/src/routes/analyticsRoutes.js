import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  getAnalytics, 
  getDashboardSummary, 
  addManualAnalytics 
} from '../controllers/analyticsController.js';

const router = express.Router();


router.use(protect);


router.get('/', getAnalytics);


router.get('/dashboard', getDashboardSummary);

// POST /api/analytics/manual - Add manual analytics data
router.post('/manual', addManualAnalytics);

export default router;