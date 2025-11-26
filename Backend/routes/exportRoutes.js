
import express from 'express';
import * as exportController from '../controllers/exportController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/monthly', exportController.exportMonthly);
router.get('/yearly', exportController.exportYearly);
router.get('/range', exportController.exportRange);

export default router;