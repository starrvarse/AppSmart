import express from 'express';
import {
  createProduct,
  updateProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
  importProducts,
} from '../controllers/productController.js';

const router = express.Router();

router.post('/', createProduct);
router.post('/import', (req, res) => {
  // Set headers for streaming response
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  importProducts(req, res);
});
router.put('/:id', updateProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.delete('/:id', deleteProduct);

export default router;
