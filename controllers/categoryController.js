// controllers/categoryController.js
import Category from '../models/categoryModel.js';
import { slugify } from '../utils.js';  

export const create = async (req, res) => {
  try {
    const { name, slug } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const s = slug || slugify(name);
    const existing = await Category.findBySlug(s);
    if (existing) return res.status(409).json({ error: 'slug already exists' });

    const created = await Category.create({ name, slug: s });
    res.status(201).json(created);
  } catch (err) {
    console.error('categoryController.create error:', err);
    res.status(500).json({ error: 'server error' });
  }
};

export const list = async (req, res) => {
  try {
    const rows = await Category.findAll();
    res.json(rows);
  } catch (err) {
    console.error('categoryController.list error:', err);
    res.status(500).json({ error: 'server error' });
  }
};

export const get = async (req, res) => {
  try {
    const { id } = req.params;
    const cat = await Category.findById(id);
    if (!cat) return res.status(404).json({ error: 'not found' });
    res.json(cat);
  } catch (err) {
    console.error('categoryController.get error:', err);
    res.status(500).json({ error: 'server error' });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug } = req.body;
    const s = slug || (name ? slugify(name) : undefined);
    const updated = await Category.update(id, { name, slug: s });
    res.json(updated);
  } catch (err) {
    console.error('categoryController.update error:', err);
    res.status(500).json({ error: 'server error' });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    await Category.remove(id);
    res.json({ success: true });
  } catch (err) {
    console.error('categoryController.remove error:', err);
    res.status(500).json({ error: 'server error' });
  }
};
