import express from 'express';
import {
  createProduct,
  updateProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
} from '../controllers/productController.js';

const router = express.Router();

router.post('/', createProduct);
router.put('/:id', updateProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.delete('/:id', deleteProduct);

export default router;
