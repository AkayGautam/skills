import express from 'express';
import multer from 'multer';
import { create, list, get, update, remove } from '../controllers/courseController.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/products'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${unique}-${file.originalname}`);
  }
});
const upload = multer({ storage });

router.post('/', upload.single('thumbnail'), create);

router.get('/', list);
router.get('/:id', get);
router.put('/:id', upload.single('thumbnail'), update);
router.delete('/:id', remove);

export default router;
