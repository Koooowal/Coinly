import express from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateCategory } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.post('/', validateCategory, categoryController.createCategory);
router.put('/:id', validateCategory, categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;