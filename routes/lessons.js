// routes/video.js
import express from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import url from 'url';

const router = express.Router();

// base URL for building absolute file URLs (falls back to localhost)
const APP_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Helper: convert stored video_url (e.g. "videos/demo.mp4") to absolute URL:
 * APP_URL + "/uploads/" + path (ensures no duplicate slashes)
 */
function toAbsoluteVideoUrl(videoUrl) {
  if (!videoUrl) return null;
  // if videoUrl is already absolute, return as-is
  if (/^https?:\/\//i.test(videoUrl)) return videoUrl;
  // Trim leading slashes then prefix with /uploads/
  const cleaned = String(videoUrl).replace(/^\/+/, '');
  return `${APP_URL.replace(/\/$/, '')}/uploads/${cleaned}`;
}

/* single video by id */
router.get('/videos/:videoId', async (req, res) => {
  try {
    const videoId = Number(req.params.videoId);
    if (!videoId) return res.status(400).json({ error: 'Invalid videoId' });
    const [rows] = await pool.query(`SELECT * FROM lesson_videos WHERE id = ? LIMIT 1`, [videoId]);
    if (!rows.length) return res.status(404).json({ error: 'Video not found' });

    const video = rows[0];
    // convert video_url to absolute if required
    if (video.video_url) video.video_url = toAbsoluteVideoUrl(video.video_url);

    res.json({ video });
  } catch (err) {
    console.error('GET /api/lessons/videos/:videoId error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* videos by lesson */
router.get('/:lessonId/videos', async (req, res) => {
  try {
    const lessonId = Number(req.params.lessonId);
    if (!lessonId) return res.status(400).json({ error: 'Invalid lessonId' });
    const [rows] = await pool.query(
      `SELECT * FROM lesson_videos WHERE lesson_id = ? ORDER BY position ASC, id ASC`,
      [lessonId]
    );

    // map each video row to include absolute video_url
    const videos = (rows || []).map((v) => {
      const copy = { ...v };
      if (copy.video_url) copy.video_url = toAbsoluteVideoUrl(copy.video_url);
      return copy;
    });

    res.json({ videos });
  } catch (err) {
    console.error('GET /api/lessons/:lessonId/videos error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* other lesson routes (unchanged) */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, course_id, category_id, title, slug, description, position, is_free, created_at
       FROM lessons ORDER BY position ASC, id ASC`
    );
    res.json({ lessons: rows });
  } catch (err) {
    console.error('GET /api/lessons error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM lessons WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Lesson not found' });
    res.json({ lesson: rows[0] });
  } catch (err) {
    console.error('GET /api/lessons/:id error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { course_id, category_id = null, title, slug, description = '', position = 0, is_free = 0 } = req.body;
    if (!course_id) return res.status(400).json({ error: 'course_id is required' });
    if (!title || !slug) return res.status(400).json({ error: 'title and slug are required' });
    const [result] = await pool.query(
      `INSERT INTO lessons (course_id, category_id, title, slug, description, position, is_free)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [course_id, category_id, title, slug, description, position, is_free]
    );
    const [rows] = await pool.query('SELECT * FROM lessons WHERE id = ?', [result.insertId]);
    res.status(201).json({ lesson: rows[0] });
  } catch (err) {
    console.error('POST /api/lessons error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const lessonId = req.params.id;
    const allowed = ['course_id', 'category_id', 'title', 'slug', 'description', 'position', 'is_free'];
    const fields = [];
    const values = [];
    for (const key of allowed) {
      if (key in req.body) {
        fields.push(`${key} = ?`);
        values.push(req.body[key]);
      }
    }
    if (!fields.length) return res.status(400).json({ error: 'No fields to update' });
    values.push(lessonId);
    await pool.query(`UPDATE lessons SET ${fields.join(', ')} WHERE id = ?`, values);
    const [rows] = await pool.query('SELECT * FROM lessons WHERE id = ?', [lessonId]);
    if (!rows.length) return res.status(404).json({ error: 'Lesson not found' });
    res.json({ lesson: rows[0] });
  } catch (err) {
    console.error('PUT /api/lessons/:id error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM lessons WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/lessons/:id error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:lessonId/videos', requireAuth, async (req, res) => {
  try {
    const lessonId = Number(req.params.lessonId);
    const [lessonRows] = await pool.query('SELECT id, course_id FROM lessons WHERE id = ?', [lessonId]);
    if (!lessonRows.length) return res.status(404).json({ error: 'Lesson not found' });
    const lesson = lessonRows[0];
    const {
      title = '',
      filename = null,
      video_url = null,
      duration_seconds = 0,
      is_preview = 0,
      video_price = 0.0,
      position = 0
    } = req.body;
    if (!video_url) return res.status(400).json({ error: 'video_url is required' });
    const [result] = await pool.query(
      `INSERT INTO lesson_videos (lesson_id, course_id, title, filename, video_url, duration_seconds, is_preview, video_price, position)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [lessonId, lesson.course_id, title, filename, video_url, duration_seconds, is_preview, video_price, position]
    );
    const [rows] = await pool.query('SELECT * FROM lesson_videos WHERE id = ?', [result.insertId]);
    // convert stored video_url to absolute for returned object
    const video = rows[0];
    if (video && video.video_url) video.video_url = toAbsoluteVideoUrl(video.video_url);
    res.status(201).json({ video });
  } catch (err) {
    console.error('POST /api/lessons/:id/videos error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/videos/:videoId', requireAuth, async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const allowed = ['title', 'filename', 'video_url', 'duration_seconds', 'is_preview', 'video_price', 'position'];
    const fields = [];
    const values = [];
    for (const key of allowed) {
      if (key in req.body) {
        fields.push(`${key} = ?`);
        values.push(req.body[key]);
      }
    }
    if (!fields.length) return res.status(400).json({ error: 'No fields to update' });
    values.push(videoId);
    await pool.query(`UPDATE lesson_videos SET ${fields.join(', ')} WHERE id = ?`, values);
    const [rows] = await pool.query('SELECT * FROM lesson_videos WHERE id = ?', [videoId]);
    const video = rows[0];
    if (video && video.video_url) video.video_url = toAbsoluteVideoUrl(video.video_url);
    res.json({ video });
  } catch (err) {
    console.error('PUT /api/videos/:id error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/videos/:videoId', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM lesson_videos WHERE id = ?', [req.params.videoId]);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/videos/:id error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
