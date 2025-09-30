// controllers/videoController.js
import pool from '../db.js';

export async function deleteLessonVideo(req, res) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid id' });

    const [result] = await pool.query('DELETE FROM lesson_videos WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lesson_video not found' });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('deleteLessonVideo error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

export async function deleteVideo(req, res) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid id' });

    // Option A: if you want to remove both lesson_videos links first (safe)
    await pool.query('DELETE FROM lesson_videos WHERE video_id = ?', [id]);
    const [result] = await pool.query('DELETE FROM videos WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('deleteVideo error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
