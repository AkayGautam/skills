import express from 'express';
import {
  listByCourse,
  create,
  getById,
  update,
  remove,
  reorder
} from '../controllers/curriculumSectionController.js';

const router = express.Router();

router.get('/api/courses/:courseId/sections', listByCourse);
router.post('/api/courses/:courseId/sections', create);

router.get('/api/sections/:id', getById);
router.put('/api/sections/:id', update);
router.delete('/api/sections/:id', remove);

router.post('/api/sections/reorder', reorder);

export default router;
