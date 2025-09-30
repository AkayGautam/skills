import express from 'express';
import { deleteVideo, deleteLessonVideo } from '../controllers/videoController.js';
const router = express.Router();

router.delete('/videos/:id', deleteVideo); 
router.delete('/lesson_videos/:id', deleteLessonVideo);

export default router;