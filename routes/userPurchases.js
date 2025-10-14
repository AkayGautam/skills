// skillAdmin/routes/userPurchases.js
import express from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Existing route - returns user's purchases with joined metadata
 */
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

/**
 * GET /api/users/access-map
 * Returns { access: { "<course_id>": true, ... } } for completed purchases
 */
router.get('/access-map', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.id) return res.status(401).json({ Error: 'Not authenticated' });

    const userId = user.id;
    const [rows] = await pool.query(
      `SELECT course_id, lesson_id, video_id, status FROM user_purchases WHERE user_id = ?`,
      [userId]
    );

    const access = rows.reduce((acc, r) => {
      if (r.status === 'completed') {
        if (r.course_id) acc[String(r.course_id)] = true;
        // optionally include lesson/video-level flags
        if (r.lesson_id) acc[`lesson:${r.lesson_id}`] = true;
        if (r.video_id) acc[`video:${r.video_id}`] = true;
      }
      return acc;
    }, {});

    return res.json({ access });
  } catch (err) {
    console.error('GET /api/users/access-map error', err);
    return res.status(500).json({ Error: 'Server error' });
  }
});

/**
 * GET /api/users/has-access
 * Query params: ?course_id=1001  OR ?lesson_id=123 OR ?video_id=456
 * Returns { hasAccess: true/false, reason?: 'completed_course'|'completed_lesson'|'completed_video' }
 */
router.get('/has-access', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.id) return res.status(401).json({ Error: 'Not authenticated' });

    const userId = user.id;
    const { course_id, lesson_id, video_id } = req.query;

    if (!course_id && !lesson_id && !video_id) {
      return res.status(400).json({ Error: 'Provide course_id or lesson_id or video_id' });
    }

    // Prioritise most-specific check: video -> lesson -> course
    const params = [userId];
    let sql = `
      SELECT status, course_id, lesson_id, video_id
      FROM user_purchases
      WHERE user_id = ?
        AND status = 'completed'
        AND (
    `;

    const conditions = [];
    if (video_id) {
      conditions.push('video_id = ?');
      params.push(video_id);
    }
    if (lesson_id) {
      conditions.push('lesson_id = ?');
      params.push(lesson_id);
    }
    if (course_id) {
      conditions.push('course_id = ?');
      params.push(course_id);
    }

    sql += conditions.join(' OR ') + ' ) LIMIT 1';

    const [rows] = await pool.query(sql, params);

    if (rows.length) {
      // determine which field matched
      const r = rows[0];
      let reason = 'completed_course';
      if (r.video_id) reason = 'completed_video';
      else if (r.lesson_id) reason = 'completed_lesson';
      else if (r.course_id) reason = 'completed_course';

      return res.json({ hasAccess: true, reason });
    }

    return res.json({ hasAccess: false });
  } catch (err) {
    console.error('GET /api/users/has-access error', err);
    return res.status(500).json({ Error: 'Server error' });
  }
});

export default router;
