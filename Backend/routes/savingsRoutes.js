import express from 'express';
import * as savingsController from '../controllers/savingsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/goals', savingsController.getAllGoals);
router.get('/goals/:id', savingsController.getGoalById);
router.post('/goals', savingsController.createGoal);
router.put('/goals/:id', savingsController.updateGoal);
router.delete('/goals/:id', savingsController.deleteGoal);
router.post('/goals/:id/deposit', savingsController.depositToGoal);

router.get('/accounts', savingsController.getAllSavingsAccounts);
router.get('/accounts/:id', savingsController.getSavingsAccountById);
router.post('/accounts', savingsController.createSavingsAccount);
router.put('/accounts/:id', savingsController.updateSavingsAccount);
router.delete('/accounts/:id', savingsController.deleteSavingsAccount);

export default router;