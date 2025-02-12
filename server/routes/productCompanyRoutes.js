import express from 'express';
import {
  createProductCompany,
  updateProductCompany,
  getAllProductCompanies,
  deleteProductCompany,
} from '../controllers/productCompanyController.js';

const router = express.Router();

router.post('/', createProductCompany);
router.put('/:id', updateProductCompany);
router.get('/', getAllProductCompanies);
router.delete('/:id', deleteProductCompany);

export default router;
