// routes/progress.js
import express from "express";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /api/progress/update
 * Body: { video_id, watched_seconds }
 * If record exists for (user_id, video_id) -> update it
 * Else -> insert new one
 */
router.post("/update", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { video_id, watched_seconds = 0 } = req.body;

    if (!video_id) {
      return res.status(400).json({ success: false, error: "video_id required" });
    }

    // Check if entry exists
    const [existing] = await pool.query(
      "SELECT id FROM user_video_progress WHERE user_id = ? AND video_id = ? LIMIT 1",
      [userId, video_id]
    );

    if (existing.length) {
      await pool.query(
        "UPDATE user_video_progress SET watched_seconds = ?, updated_at = NOW() WHERE id = ?",
        [watched_seconds, existing[0].id]
      );
    } else {
      await pool.query(
        "INSERT INTO user_video_progress (user_id, video_id, watched_seconds, completed) VALUES (?, ?, ?, ?)",
        [userId, video_id, watched_seconds, 0]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error("POST /api/progress/update error", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;
