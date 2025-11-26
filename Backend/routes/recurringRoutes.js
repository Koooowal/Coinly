import express from 'express';
import * as recurringController from '../controllers/recurringController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', recurringController.getAllRecurring);
router.post('/', recurringController.createRecurring);
router.get('/:id', recurringController.getRecurringById);
router.put('/:id', recurringController.updateRecurring);
router.delete('/:id', recurringController.deleteRecurring);
router.patch('/:id/toggle', recurringController.toggleActiveStatus);

export default router;