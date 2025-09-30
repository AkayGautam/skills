// controllers/curriculumSectionController.js
import pool from '../db.js';
import {
  createSection,
  findByCourse,
  findById,
  updateSection,
  removeSection,
  bulkUpdateOrder
} from '../models/curriculumSectionModel.js';

async function resolveCourseId(param) {
  if (!param) return null;

  if (/^\d+$/.test(String(param))) {
    return Number(param);
  }

  const sql = `SELECT id FROM courses WHERE slug = ? OR title = ? LIMIT 1`;
  const [rows] = await pool.query(sql, [param, param]);
  if (rows && rows.length > 0) return rows[0].id;
  return null;
}

const sendError = (res, status = 400, message = 'Bad Request') => res.status(status).json({ success: false, message });

export const listByCourse = async (req, res) => {
  const rawCourseParam = req.params.courseId || req.params.id;
  try {
    const courseId = await resolveCourseId(rawCourseParam);
    if (!courseId) return sendError(res, 404, 'Course not found');

    const [rows] = await findByCourse(courseId);
    return res.json({ success: true, sections: rows });
  } catch (err) {
    console.error('[listByCourse] error:', err);
    return sendError(res, 500, 'Server error fetching sections');
  }
};

export const getById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await findById(id);
    const section = rows[0] || null;
    if (!section) return sendError(res, 404, 'Section not found');
    return res.json({ success: true, section });
  } catch (err) {
    console.error('[getById] error:', err);
    return sendError(res, 500, 'Server error');
  }
};

export const create = async (req, res) => {
  const rawCourseParam = req.params.courseId || req.params.id;
  const { title, description, sort_order, is_published } = req.body;

  if (!title) return sendError(res, 400, 'title is required');

  try {
    const courseId = await resolveCourseId(rawCourseParam);
    if (!courseId) return sendError(res, 404, 'Course not found');

    console.log('[create section] courseId resolved to', courseId, 'body:', req.body);

    const [result] = await createSection({
      course_id: courseId,
      title,
      description,
      sort_order: sort_order ?? 0,
      is_published: is_published ?? 1
    });

    const [rows] = await findById(result.insertId);
    return res.status(201).json({ success: true, section: rows[0] });
  } catch (err) {
    console.error('[create section] DB error:', err);
    return sendError(res, 500, 'Server error creating section');
  }
};

export const update = async (req, res) => {
  const { id } = req.params;
  const { title, description, sort_order, is_published } = req.body;
  try {
    const [existsRows] = await findById(id);
    const exists = existsRows[0];
    if (!exists) return sendError(res, 404, 'Section not found');

    await updateSection(id, { title, description, sort_order, is_published });
    const [updatedRows] = await findById(id);
    return res.json({ success: true, section: updatedRows[0] });
  } catch (err) {
    console.error('[update section] error:', err);
    return sendError(res, 500, 'Server error updating section');
  }
};

export const remove = async (req, res) => {
  const { id } = req.params;
  try {
    const [existsRows] = await findById(id);
    const exists = existsRows[0];
    if (!exists) return sendError(res, 404, 'Section not found');

    await removeSection(id);
    return res.json({ success: true, message: 'Section deleted' });
  } catch (err) {
    console.error('[remove section] error:', err);
    return sendError(res, 500, 'Server error deleting section');
  }
};

export const reorder = async (req, res) => {
  const { updates } = req.body;
  if (!Array.isArray(updates) || updates.length === 0) return sendError(res, 400, 'updates array required');

  try {
    await bulkUpdateOrder(updates);
    return res.json({ success: true });
  } catch (err) {
    console.error('[reorder sections] error:', err);
    return sendError(res, 500, 'Failed to reorder sections');
  }
};


 