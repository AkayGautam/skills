import express from 'express';
import { uploadSingleVideo } from '../middleware/upload.js';

const router = express.Router();

router.post('/', (req, res) => {
  uploadSingleVideo(req, res, function (err) {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ success: false, error: err.message || 'Upload failed' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
 
    const filePath = `/uploads/videos/${req.file.filename}`;
    return res.json({ success: true, url: filePath, filename: req.file.filename });
  });
});

export default router;
