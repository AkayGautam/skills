
import express from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/:id/access', async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user?.id ?? null; 

    const [vrows] = await pool.query('SELECT * FROM lesson_videos WHERE id = ?', [videoId]);
    if (!vrows.length) return res.status(404).json({ allowed: false, error: 'Video not found' });
    const video = vrows[0];

    if (Number(video.is_preview) === 1) {
      return res.json({ allowed: true, video_url: video.video_url, video });
    }

    if (userId) {
      const [prows] = await pool.query(
        `SELECT id FROM user_purchases WHERE user_id = ? AND video_id = ? AND status = 'completed' LIMIT 1`,
        [userId, videoId]
      );
      if (prows.length) {
        return res.json({ allowed: true, video_url: video.video_url, video });
      }
    }

    return res.json({ allowed: false, message: 'Purchase required' });
  } catch (err) {
    console.error('GET /api/videos/:id/access error', err);
    return res.status(500).json({ allowed: false, error: 'Server error' });
  }
});

router.post('/:id/purchase', requireAuth, async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user.id;
    const {
      amount = null,
      currency = 'INR',
      payment_provider = 'dummy',
      payment_reference = null
    } = req.body || {};

    const [vrows] = await pool.query('SELECT * FROM lesson_videos WHERE id = ?', [videoId]);
    if (!vrows.length) return res.status(404).json({ error: 'Video not found' });
    const video = vrows[0];

    const [existing] = await pool.query(
      'SELECT id FROM user_purchases WHERE user_id = ? AND video_id = ? AND status = "completed" LIMIT 1',
      [userId, videoId]
    );
    if (existing.length) return res.json({ success: true, message: 'Already purchased' });

    const finalAmount = amount !== null ? parseFloat(amount) : parseFloat(video.video_price || 0);

    const [ins] = await pool.query(
      `INSERT INTO user_purchases
       (user_id, course_id, lesson_id, video_id, amount, currency, payment_provider, payment_reference, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed')`,
      [userId, video.course_id || null, video.lesson_id || null, videoId, finalAmount, currency, payment_provider, payment_reference]
    );

 
    return res.json({ success: true, purchaseId: ins.insertId });
  } catch (err) {
    console.error('POST /api/videos/:id/purchase error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
