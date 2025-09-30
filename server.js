// server.js
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import express from "express";
import cors from "cors";
import path from 'path';
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import courseRoutes from './routes/courseRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import publicCourseRoutes from './routes/publicCourseRoutes.js';
import curriculumSectionsRouter from './routes/curriculumSections.js';
import lessonsRouter from './routes/lessons.js'; 
import uploadRouter from './routes/upload.js';
import videosRouter from './routes/videos.js';
import userPurchasesRouter from './routes/userPurchases.js';
import videoRoutes from './routes/videoRoutes.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));
app.use(cookieParser());
 
app.use(express.static(path.join(process.cwd(), 'public')));
app.use('/api/upload', uploadRouter);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.get("/ping", (req, res) => res.json({ status: "ok", time: Date.now() }));
app.use("/api/auth", authRoutes);
app.use('/api/users', userPurchasesRouter);
app.use("/api/users", userRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/public/courses', publicCourseRoutes);
app.use(curriculumSectionsRouter);
app.use('/api/lessons', lessonsRouter);
app.use('/api/videos', videosRouter);
app.use('/api', videoRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ success: false, error: err.message || 'Server error' });
});

//console.log("About to call app.listen...");
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
