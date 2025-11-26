import express from 'express';
import * as importController from '../controllers/importController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);


router.post('/transactions', importController.importTransactions);
router.post('/preview', importController.previewImport);
router.get('/template', importController.downloadTemplate);

export default router;