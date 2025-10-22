import express from 'express';
import * as accountController from '../controllers/accountController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateAccount } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', accountController.getAllAccounts);
router.get('/:id', accountController.getAccountById);
router.post('/', validateAccount, accountController.createAccount);
router.put('/:id', validateAccount, accountController.updateAccount);
router.delete('/:id', accountController.deleteAccount);

export default router;