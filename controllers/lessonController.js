// controllers/lessonController.js
import pool from '../db.js'; 

export async function getVideosByLesson(req, res) {
  try {
    const lessonId = Number(req.params.lessonId);
    if (!lessonId || Number.isNaN(lessonId)) {
      return res.status(400).json({ error: 'Invalid lessonId' });
    }

    console.log('[GET VIDEOS] incoming lessonId=', lessonId);

    const sql = `
      SELECT lv.id AS lesson_video_id, lv.lesson_id, lv.video_id,
             v.id AS video_id, v.title, v.url AS video_url, v.duration, v.provider, v.created_at
      FROM lesson_videos lv
      JOIN videos v ON v.id = lv.video_id
      WHERE lv.lesson_id = ?
      ORDER BY lv.id DESC
    `;

    const [rows] = await pool.query(sql, [lessonId]);

    console.log(`[GET VIDEOS] found ${rows.length} rows for lesson ${lessonId}`);

    return res.json({ videos: rows });
  } catch (err) {
    console.error('getVideosByLesson error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
