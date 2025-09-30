// controllers/courseController.js
import Course from '../models/courseModel.js';
import { slugify } from '../utils.js';

export const create = async (req, res) => {
  try {
    // console.log('Headers:', req.headers);
    // console.log('req.is multipart?', req.is && req.is('multipart/form-data'));
    // console.log('req.file:', req.file);   
    // console.log('req.body:', req.body);

    const body = req.body || {};   
    if (!body.title || !body.author_id) {
      return res.status(400).json({ error: 'title and author_id required' });
    }

    if (req.file) {
      body.thumbnail = `/uploads/products/${req.file.filename}`;
    }

    body.slug = body.slug || slugify(body.title);
    const created = await Course.create(body);
    res.status(201).json(created);
  } catch (err) {
    console.error('courseController.create error:', err);
    res.status(500).json({ error: 'server error' });
  }
};

export const list = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const category_id = req.query.category_id || null;
    const rows = await Course.findAll({ page, limit, category_id });
    res.json(rows);
  } catch (err) {
    console.error('courseController.list error:', err);
    res.status(500).json({ error: 'server error' });
  }
};

export const get = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ error: 'not found' });
    res.json(course);
  } catch (err) {
    console.error('courseController.get error:', err);
    res.status(500).json({ error: 'server error' });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    if (body.title && !body.slug) body.slug = slugify(body.title);
    const updated = await Course.update(id, body);
    res.json(updated);
  } catch (err) {
    console.error('courseController.update error:', err);
    res.status(500).json({ error: 'server error' });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    await Course.remove(id);
    res.json({ success: true });
  } catch (err) {
    console.error('courseController.remove error:', err);
    res.status(500).json({ error: 'server error' });
  }
};
