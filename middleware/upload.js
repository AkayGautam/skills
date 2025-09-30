import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'videos');


if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext)
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-_]/g, '')
      .slice(0, 50);
    const name = `${Date.now()}-${base}${ext}`;
    cb(null, name);
  }
});

function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith('video/')) {
    return cb(new Error('Only video files are allowed'), false);
  }
  cb(null, true);
}

const limits = {
  fileSize: 1024 * 1024 * 1024 * 1 
};

export const uploadSingleVideo = multer({ storage, fileFilter, limits }).single('file');
