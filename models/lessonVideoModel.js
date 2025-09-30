import pool from '../db.js';

const LessonVideo = {
  async create({ lesson_id, course_id, title, filename, video_url, duration_seconds=0, is_preview=0, video_price=0.00, position=0 }) {
    const sql = `INSERT INTO lesson_videos (lesson_id, course_id, title, filename, video_url, duration_seconds, is_preview, video_price, position)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [res] = await pool.query(sql, [lesson_id, course_id, title, filename, video_url, duration_seconds, is_preview, video_price, position]);
    return { id: res.insertId, ...arguments[0] };
  },

  async findByLesson(lesson_id) {
    const [rows] = await pool.query('SELECT * FROM lesson_videos WHERE lesson_id = ? ORDER BY position ASC', [lesson_id]);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM lesson_videos WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async update(id, fields = {}) {
    const allowed = ['title','filename','video_url','duration_seconds','is_preview','video_price','position'];
    const sets = []; const vals = [];
    for (const k of allowed) if (k in fields) { sets.push(`${k} = ?`); vals.push(fields[k]); }
    if (!sets.length) return this.findById(id);
    vals.push(id);
    const sql = `UPDATE lesson_videos SET ${sets.join(', ')} WHERE id = ?`;
    await pool.query(sql, vals);
    return this.findById(id);
  },

  async delete(id) {
    await pool.query('DELETE FROM lesson_videos WHERE id = ?', [id]);
    return true;
  }
};

export default LessonVideo;
