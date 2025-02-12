import express from 'express';
import {
  createDocument,
  getDocumentsByUserId,
} from '../controllers/documentController.js';

const router = express.Router();

router.post('/', createDocument);
router.get('/:userId', getDocumentsByUserId);

export default router;
