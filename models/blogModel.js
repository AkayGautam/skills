import pool from "../db.js";

export const createBlog = (values) => {
  const sql = `INSERT INTO blogs (blogName, blogDiscription, authorName, metatitle, metaDiscription, createdAt, image)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
  return pool.query(sql, values);
};

export const getAllBlogs = () => {
  return pool.query("SELECT * FROM blogs ORDER BY id DESC");
};

export const getBlogById = (id) => {
  return pool.query("SELECT * FROM blogs WHERE id = ? LIMIT 1", [id]);
};

export const updateBlog = (id, fields, params) => {
  const sql = `UPDATE blogs SET ${fields.join(", ")} WHERE id = ?`;
  return pool.query(sql, [...params, id]);
};

export const deleteBlog = (id) => {
  return pool.query("DELETE FROM blogs WHERE id = ?", [id]);
};
