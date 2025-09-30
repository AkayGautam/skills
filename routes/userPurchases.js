import express from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/purchases', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      console.warn('GET /api/users/purchases - unauthenticated request');
      return res.status(401).json({ Error: 'Not authenticated' });
    }

    const userId = user.id;
    console.log(`[userPurchases] fetching purchases for user ${userId}`);

    const sql = `
      SELECT up.id AS purchase_id,
             up.user_id,
             up.course_id,
             up.lesson_id,
             up.video_id,
             up.amount,
             up.currency,
             up.payment_provider,
             up.payment_reference,
             up.status,
             up.purchased_at,
             lv.title AS video_title,
             lv.video_url,
             lv.video_price,
             l.title AS lesson_title,
             c.title AS course_title
      FROM user_purchases up
      LEFT JOIN lesson_videos lv ON up.video_id = lv.id
      LEFT JOIN lessons l ON up.lesson_id = l.id
      LEFT JOIN courses c ON up.course_id = c.id
      WHERE up.user_id = ?
      ORDER BY up.purchased_at DESC
    `;
    const [rows] = await pool.query(sql, [userId]);

    return res.json({ purchases: rows || [] });
  } catch (err) {
    console.error('GET /api/users/purchases error', err);
    return res.status(500).json({ Error: 'Server error' });
  }
});

export default router;
