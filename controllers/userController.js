// controllers/userController.js
import pool from "../db.js";

// GET /users
export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, name, email, role FROM users");
    return res.json({ users: rows });
  } catch (err) {
    console.error("getAllUsers error:", err);
    return res.status(500).json({ Error: "Error fetching users" });
  }
};

// GET /users/:id
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1",
      [id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ Error: "User not found" });
    }

    return res.json({ user: rows[0] });
  } catch (err) {
    console.error("getUserById error:", err);
    return res.status(500).json({ Error: "Error fetching user" });
  }
};

// UPDATE user (name/email/password)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    if (!name || !email) {
      return res
        .status(400)
        .json({ Error: "Name and email are required" });
    }

    const fields = [];
    const values = [];
    if (name !== undefined) {
      fields.push("name = ?");
      values.push(name);
    }
    if (email !== undefined) {
      fields.push("email = ?");
      values.push(email);
    }
    if (password !== undefined && password !== "") {
      fields.push("password = ?");
      values.push(password);
    }

    if (fields.length === 0) {
      return res.status(400).json({ Error: "No fields to update" });
    }

    values.push(id);
    const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
    const [result] = await pool.query(sql, values);

    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ Error: "User not found" });
    }

    return res.json({ Status: "Success", Message: "User updated" });
  } catch (err) {
    console.error("updateUser error:", err);
    return res
      .status(500)
      .json({ Status: "Error", Error: err.message });
  }
};

// DELETE /users/:id
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ Error: "User ID is required" });
    }

    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ Error: "User not found" });
    }

    return res.json({ Status: "Success", Message: `User ${id} deleted` });
  } catch (err) {
    console.error("deleteUser error:", err);
    return res
      .status(500)
      .json({ Error: "Server error", Details: err.message });
  }
};

// ADMIN: Change user role
export const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ["user", "editor", "admin"];
    if (!allowedRoles.includes(role)) {
      return res
        .status(400)
        .json({ Error: "Invalid role. Must be user, editor, or admin." });
    }

    const [result] = await pool.query(
      "UPDATE users SET role = ? WHERE id = ?",
      [role, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ Error: "User not found" });
    }

    return res.json({ Status: "Success", Message: `Role updated to ${role}` });
  } catch (err) {
    console.error("changeUserRole error:", err);
    return res
      .status(500)
      .json({ Error: "Server error", Details: err.message });
  }
};
 
export const listUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
    );
    return res.json({ users: rows });
  } catch (err) {
    console.error("listUsers error:", err);
    return res
      .status(500)
      .json({ Error: "Server error", Details: err.message });
  }
};
