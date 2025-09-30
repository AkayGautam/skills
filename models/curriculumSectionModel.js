import pool from '../db.js';

export const createSection = ({ course_id, title, description = null, sort_order = 0, is_published = 1 }) => {
  const sql = `INSERT INTO curriculum_sections (course_id, title, description, sort_order, is_published)
               VALUES (?, ?, ?, ?, ?)`;
  return pool.query(sql, [course_id, title, description, sort_order, is_published]);
};

export const findByCourse = (courseId) => {
  const sql = `SELECT * FROM curriculum_sections WHERE course_id = ? ORDER BY sort_order, id DESC`;
  return pool.query(sql, [courseId]);
};

export const findById = (id) => {
  const sql = `SELECT * FROM curriculum_sections WHERE id = ? LIMIT 1`;
  return pool.query(sql, [id]);
};

export const updateSection = (id, { title, description, sort_order, is_published }) => {
 
  const sql = `UPDATE curriculum_sections
               SET title = COALESCE(?, title),
                   description = COALESCE(?, description),
                   sort_order = COALESCE(?, sort_order),
                   is_published = COALESCE(?, is_published),
                   updated_at = CURRENT_TIMESTAMP
               WHERE id = ?`;
  return pool.query(sql, [title, description, sort_order, is_published, id]);
};

export const removeSection = (id) => {
  const sql = `DELETE FROM curriculum_sections WHERE id = ?`;
  return pool.query(sql, [id]);
};
 
export const bulkUpdateOrder = async (updates) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const u of updates) {
      await conn.query('UPDATE curriculum_sections SET sort_order = ? WHERE id = ?', [u.sort_order, u.id]);
    }
    await conn.commit();
    return [ { success: true } ];
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
