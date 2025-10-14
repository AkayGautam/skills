// /routes/recentVideos.js
import express from "express";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/recent-videos", requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.id)
      return res.status(401).json({ error: "Not authenticated" });

    // ✅ Check table
    const [check] = await pool.query("SHOW TABLES LIKE 'user_video_progress'");

    let sql = "";
    if (check.length) {
      sql = `
        SELECT 
          uv.video_id,
          lv.title AS video_title,
          lv.video_url,
          lv.video_price,
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
    } else {
      sql = `
        SELECT 
          up.video_id,
          up.lesson_id,
          up.course_id,
          lv.title AS video_title,
          lv.video_url,
          lv.video_price,
          l.title AS lesson_title,
          c.title AS course_title,
          up.purchased_at AS last_watched_at
        FROM user_purchases up
        JOIN lesson_videos lv ON up.video_id = lv.id
        JOIN lessons l ON up.lesson_id = l.id
        LEFT JOIN courses c ON up.course_id = c.id
        WHERE up.user_id = ?
        AND up.status = 'completed'
        ORDER BY up.purchased_at DESC
        LIMIT 3
      `;
    }

    const [rows] = await pool.query(sql, [user.id]);

    const recent = rows.map((r) => ({
      video_id: r.video_id,
      lesson_id: r.lesson_id,
      course_id: r.course_id,
      video_title: r.video_title,
      video_url: r.video_url?.startsWith("http")
        ? r.video_url
        : `/uploads/${String(r.video_url).replace(/^\/?uploads\/?/, "")}`,
      thumbnail: "/assets/img/default-thumb.jpg",
      lesson_title: r.lesson_title,
      course_title: r.course_title,
      duration_seconds: r.duration_seconds || null,
    }));

    return res.json({ recent });
  } catch (err) {
    console.error("GET /api/users/recent-videos error", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
