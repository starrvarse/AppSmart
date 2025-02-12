import express from 'express';
import {
  createUnit,
  updateUnit,
  getAllUnits,
  deleteUnit,
} from '../controllers/unitController.js';

const router = express.Router();

router.post('/', createUnit);
router.put('/:id', updateUnit);
router.get('/', getAllUnits);
router.delete('/:id', deleteUnit);

export default router;
