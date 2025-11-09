import express from 'express';
import * as budgetController from '../controllers/budgetController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateBudget } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', budgetController.getAllBudgets);
router.get('/:id', budgetController.getBudgetById);
router.get('/:id/status', budgetController.getBudgetStatus);
router.post('/', validateBudget, budgetController.createBudget);
router.put('/:id', validateBudget, budgetController.updateBudget);
router.delete('/:id', budgetController.deleteBudget);

export default router;