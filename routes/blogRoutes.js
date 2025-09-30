import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
 
import { create, list, getById, update, remove } from "../controllers/blogController.js";

 
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

const router = express.Router();

router.post("/", upload.single("image"), create);
router.get("/", list);
router.get("/:id", getById);
router.put("/:id", upload.single("image"), update);
router.delete("/:id", remove);

export default router;
