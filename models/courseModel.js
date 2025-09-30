// models/courseModel.js
import pool from '../db.js';

const Course = {
  async create(data) {
    const sql = `INSERT INTO courses
      (title, slug, short_description, description, content, author_id, level, language, duration, price, thumbnail, video_url, meta_title, meta_description, status, certificates_enabled)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
      data.title,
      data.slug,
      data.short_description || null,
      data.description || null,
      data.content || null,
      data.author_id,
      data.level || 'Beginner',
      data.language || 'EN',
      data.duration || null,
      data.price || 0.0,
      data.thumbnail || null,
      data.video_url || null,
      data.meta_title || null,
      data.meta_description || null,
      data.status || 'draft',
      data.certificates_enabled ? 1 : 0
    ];

    const [result] = await pool.query(sql, params);
    return this.findById(result.insertId);
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM courses WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async findBySlug(slug) {
    const [rows] = await pool.query('SELECT * FROM courses WHERE slug = ?', [slug]);
    return rows[0] || null;
  },

  async findAll({ page = 1, limit = 20, category_id = null } = {}) {
    const offset = (page - 1) * limit;

    if (category_id) {
      const sql = `SELECT c.* FROM courses c
        JOIN course_categories cc ON cc.course_id = c.id
        WHERE cc.category_id = ?
        ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
      const [rows] = await pool.query(sql, [category_id, Number(limit), Number(offset)]);
      return rows;
    }

    const [rows] = await pool.query(
      'SELECT * FROM courses ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [Number(limit), Number(offset)]
    );
    return rows;
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    const allowed = [
      'title','slug','short_description','description','content',
      'level','language','duration','price','thumbnail','video_url',
      'meta_title','meta_description','status','certificates_enabled',
      'start_on', 'launch_fee', 'category_id'
    ];

   for (const k of allowed) {
  if (Object.prototype.hasOwnProperty.call(data, k)) {
    let value = data[k];

    if (value === "null" || value === "" || value === undefined) {
      value = null;
    }
    if (k === "category_id" && value !== null) {
      value = Number(value);
    }
    if (k === "certificates_enabled" && value !== null) {
      value = value === true || value === "1" ? 1 : 0;
    }

    fields.push(`${k} = ?`);
    values.push(value);
  }
}

    if (fields.length === 0) return this.findById(id);

    const sql = `UPDATE courses SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);
    await pool.query(sql, values);
    return this.findById(id);
  },

  async remove(id) {
    await pool.query('DELETE FROM courses WHERE id = ?', [id]);
    return true;
  },


async findPublishedById(id) {
  const [rows] = await pool.query(
    'SELECT * FROM courses WHERE id = ? AND status = ?',
    [id, 'published']
  );
  return rows[0] || null;
},


async findPublishedBySlug(slug) {
  const [rows] = await pool.query(
    'SELECT * FROM courses WHERE slug = ? AND status = ?',
    [slug, 'published']
  );
  return rows[0] || null;
},

async findAllPublished() {
  const [rows] = await pool.query(
    'SELECT * FROM courses WHERE status = ? ORDER BY created_at DESC',
    ['published']
  );
  return rows;
}, 




};

export default Course;
