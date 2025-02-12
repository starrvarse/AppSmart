import express from 'express';
import {
  createCategory,
  updateCategory,
  getAllCategories,
  deleteCategory,
} from '../controllers/categoryController.js';

const router = express.Router();

router.post('/', createCategory);
router.put('/:id', updateCategory);
router.get('/', getAllCategories);
router.delete('/:id', deleteCategory);

export default router;
