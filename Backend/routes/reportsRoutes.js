import express from 'express';
import * as reportController from '../controllers/reportController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/monthly', reportController.getMonthlyReport);
router.get('/yearly', reportController.getYearlyReport);
router.get('/category', reportController.getCategoryReport);
router.get('/expenses-by-period', reportController.getExpensesByPeriod);
router.get('/income-vs-expenses', reportController.getIncomeVsExpenses);

export default router;