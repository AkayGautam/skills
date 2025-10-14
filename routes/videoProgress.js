// /routes/videoProgress.js
import express from "express";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/:videoId/progress", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const videoId = Number(req.params.videoId);
    const { watched_seconds = 0, completed = 0 } = req.body;

    if (!videoId) return res.status(400).json({ error: "Invalid videoId" });

    await pool.query(
      `INSERT INTO user_video_progress (user_id, video_id, watched_seconds, completed)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE watched_seconds = VALUES(watched_seconds), completed = VALUES(completed), updated_at = NOW()`,
      [userId, videoId, watched_seconds, completed]
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("POST /api/videos/:videoId/progress error", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
