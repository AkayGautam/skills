// routes/userRoutes.js
import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changeUserRole,
  listUsers,
} from "../controllers/userController.js";

import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/recent-videos", requireAuth, async (req, res) => {
  try {
    const userId = Number(req.user?.id);
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const sql = `
      SELECT 
        uv.video_id AS video_id,
        lv.title AS video_title,
        lv.thumbnail AS thumbnail,
        lv.video_url AS video_url,
        lv.video_price AS video_price,
        l.id AS lesson_id,
        l.title AS lesson_title,
        c.id AS course_id,
        c.title AS course_title,
        MAX(uv.updated_at) AS last_watched_at
      FROM user_video_progress uv
      JOIN lesson_videos lv ON uv.video_id = lv.id
      JOIN lessons l ON lv.lesson_id = l.id
      LEFT JOIN courses c ON l.course_id = c.id
      WHERE uv.user_id = ?
      GROUP BY uv.video_id
      ORDER BY last_watched_at DESC
      LIMIT 3
    `;

    const [rows] = await pool.query(sql, [userId]);

    // Normalize thumbnail and video_url so frontend can use them directly if needed
    const base = (process.env.APP_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");
    const normalized = rows.map((r) => {
      const thumb = r.thumbnail ? String(r.thumbnail).replace(/^\/+/, "") : null;
      const vurl = r.video_url ? String(r.video_url).replace(/^\/+/, "") : null;
      return {
        ...r,
        thumbnail: thumb ? `${base}/${thumb}` : null,
        video_url: vurl ? `${base}/${vurl}` : null,
      };
    });

    return res.json({ recent: normalized });
  } catch (err) {
    console.error("GET /api/users/recent-videos error", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// -----------------------------
// existing routes (kept as-is)
// -----------------------------
router.post("/:id/role", changeUserRole);
router.get("/admin", listUsers);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
