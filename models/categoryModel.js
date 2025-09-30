import pool from '../db.js';

const Category = {
  async create({ name, slug }) {
    const sql = 'INSERT INTO categories (name, slug) VALUES (?, ?)';
    const [result] = await pool.query(sql, [name, slug]);
    return { id: result.insertId, name, slug };
  },

  async findAll() {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name');
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async findBySlug(slug) {
    const [rows] = await pool.query('SELECT * FROM categories WHERE slug = ?', [slug]);
    return rows[0] || null;
  },

  async update(id, { name, slug }) {
    await pool.query('UPDATE categories SET name = ?, slug = ? WHERE id = ?', [name, slug, id]);
    return this.findById(id);
  },

  async remove(id) {
    await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    return true;
  }
};

export default Category;
