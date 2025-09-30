import { createBlog, getAllBlogs, getBlogById, updateBlog, deleteBlog } from "../models/blogModel.js";
import { parseNullable } from "../utils.js";

export const create = async (req, res) => {
  try {
    const body = req.body || {};
    const { blogName, blogDiscription, authorName, metatitle, metaDiscription, createdAt } = body;

    if (!blogName || !blogDiscription) {
      return res.status(400).json({ success: false, error: "blogName and blogDiscription are required" });
    }

    let imagePath = null;
    if (req.file) imagePath = `/uploads/${req.file.filename}`;
    else if (body.image) imagePath = body.image;

    const values = [
      blogName,
      blogDiscription,
      parseNullable(authorName),
      parseNullable(metatitle),
      parseNullable(metaDiscription),
      parseNullable(createdAt),
      parseNullable(imagePath)
    ];

    const [result] = await createBlog(values);
    res.json({ success: true, insertedId: result.insertId, imagePath });
  } catch (err) {
    console.error("POST /blogs error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const list = async (req, res) => {
  try {
    const [rows] = await getAllBlogs();
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const [rows] = await getBlogById(req.params.id);
    if (!rows.length) return res.status(404).json({ success: false, error: "blog not found" });
    res.json({ success: true, blog: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body || {};
    const allowed = ["blogName","blogDiscription","authorName","metatitle","metaDiscription","createdAt"];
    const fields = [];
    const params = [];

    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        fields.push(`${key} = ?`);
        params.push(parseNullable(body[key]));
      }
    }
    if (req.file) {
      fields.push("image = ?");
      params.push(`/uploads/${req.file.filename}`);
    }

    if (!fields.length) return res.status(400).json({ success: false, error: "No fields to update" });

    const [result] = await updateBlog(id, fields, params);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const [result] = await deleteBlog(req.params.id);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
