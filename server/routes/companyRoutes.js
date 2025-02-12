import express from 'express';
import { getCompanyDetails, updateCompanyDetails } from '../controllers/companyController.js';

const router = express.Router();

router.get('/', getCompanyDetails);
router.put('/', updateCompanyDetails);

export default router;
