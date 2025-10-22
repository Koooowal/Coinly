import express from 'express';
import * as transactionController from '../controllers/transactionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateTransaction } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', transactionController.getAllTransactions);
router.get('/stats', transactionController.getTransactionStats);
router.get('/:id', transactionController.getTransactionById);
router.post('/', validateTransaction, transactionController.createTransaction);
router.put('/:id', validateTransaction, transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

export default router;