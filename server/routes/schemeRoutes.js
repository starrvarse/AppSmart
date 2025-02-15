import express from 'express';
import {
  createScheme,
  getAllSchemes,
  getSchemeById,
  updateScheme,
  deleteScheme,
} from '../controllers/schemeController.js';

const router = express.Router();

router.post('/', createScheme);
router.get('/', getAllSchemes);
router.get('/:id', getSchemeById);
router.put('/:id', updateScheme);
router.delete('/:id', deleteScheme);

export default router;
