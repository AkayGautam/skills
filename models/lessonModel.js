import pool from '../db.js';

const Lesson = {
  async create({ course_id, category_id, title, slug, description, position = 0, is_free = 0 }) {
    const sql = `INSERT INTO lessons (course_id, category_id, title, slug, description, position, is_free)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [res] = await pool.query(sql, [course_id, category_id, title, slug, description, position, is_free]);
    return { id: res.insertId, course_id, category_id, title, slug, description, position, is_free };
  },

  async findByCourse(course_id) {
    const [rows] = await pool.query('SELECT * FROM lessons WHERE course_id = ? ORDER BY position ASC', [course_id]);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM lessons WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async update(id, fields = {}) {
    const allowed = ['title','slug','description','position','is_free','category_id'];
    const sets = []; const vals = [];
    for (const k of allowed) if (k in fields) { sets.push(`${k} = ?`); vals.push(fields[k]); }
    if (!sets.length) return this.findById(id);
    vals.push(id);
    const sql = `UPDATE lessons SET ${sets.join(', ')} WHERE id = ?`;
    await pool.query(sql, vals);
    return this.findById(id);
  },

  async delete(id) {
    await pool.query('DELETE FROM lessons WHERE id = ?', [id]);
    return true;
  }
};

export default Lesson;
