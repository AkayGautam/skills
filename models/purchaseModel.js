import pool from '../db.js';

const Purchase = {
  async create({ user_id, course_id=null, lesson_id=null, video_id=null, amount, currency='USD', payment_provider=null, payment_reference=null, status='completed' }) {
    const sql = `INSERT INTO user_purchases (user_id, course_id, lesson_id, video_id, amount, currency, payment_provider, payment_reference, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [res] = await pool.query(sql, [user_id, course_id, lesson_id, video_id, amount, currency, payment_provider, payment_reference, status]);
    return { id: res.insertId };
  },

async hasAccessToVideo(user_id, video_id) {
  if (!user_id) return false;
  const [rows] = await pool.query(`
    SELECT 1 FROM user_purchases
    WHERE user_id = ? AND status = 'completed' AND (
      video_id = ? OR course_id = (SELECT course_id FROM lesson_videos WHERE id = ?)
    ) LIMIT 1
  `, [user_id, video_id, video_id]);
  return rows.length > 0;
}


};

export default Purchase;
