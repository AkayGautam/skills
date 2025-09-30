import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  createUser,
  findUserByEmail,
  updateUserRole,
  getAllUsers,
} from "../models/userModel.js";

// REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ Status: "Error", Error: "name, email and password required" });
    }

    const [rows] = await findUserByEmail(email);
    if (Array.isArray(rows) && rows.length > 0) {
      return res
        .status(409)
        .json({ Status: "Error", Error: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password.toString(), 10);
    const [result] = await createUser(name, email, hashed, "user");

    return res
      .status(201)
      .json({ Status: "Success", insertedId: result?.insertId ?? null });
  } catch (err) {
    console.error("[REGISTER] error:", err);
    return res.status(500).json({ Status: "Error", Error: String(err) });
  }
};

export const changeUserRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    const allowedRoles = ["user", "editor", "admin"];
    if (!allowedRoles.includes(role)) {
      return res
        .status(400)
        .json({ Status: "Error", Error: "Invalid role" });
    }

    const [result] = await updateUserRole(userId, role);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ Status: "Error", Error: "User not found" });
    }

    return res.json({ Status: "Success", userId, role });
  } catch (err) {
    console.error("[CHANGE ROLE] error:", err);
    return res
      .status(500)
      .json({ Status: "Error", Error: String(err) });
  }
};

export const listUsers = async (req, res) => {
  try {
    const [rows] = await getAllUsers();
    return res.json({ Status: "Success", users: rows });
  } catch (err) {
    console.error("[LIST USERS] error:", err);
    return res
      .status(500)
      .json({ Status: "Error", Error: String(err) });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    console.log("[LOGIN] body:", req.body);

    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ Error: "email and password required" });
    }

    const [rows] = await findUserByEmail(email);
    if (!rows || rows.length === 0) {
      console.warn("[LOGIN] no user found for", email);
      return res.status(401).json({ Error: "No Email existed" });
    }

    const user = rows[0];
    if (!user.password) {
      console.error("[LOGIN] user has no password hash:", user);
      return res.status(500).json({ Error: "User record invalid" });
    }

    const match = await bcrypt.compare(password.toString(), user.password);
    if (!match) {
      console.warn("[LOGIN] password mismatch for", email);
      return res.status(401).json({ Error: "Password Not Matched" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("[LOGIN] JWT_SECRET missing in environment");
      return res.status(500).json({ Error: "Server config error: JWT_SECRET not set" });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(safeUser, process.env.JWT_SECRET, { expiresIn: "4h" });

    res.cookie("auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ Status: "Success", user: safeUser, token });
  } catch (err) {
    console.error("[LOGIN] unhandled error:", err);
    return res.status(500).json({
      Error: "Login failed",
      detail: err?.message || String(err),
    });
  }
};

export const logout = (req, res) => {
  try {
    const cookieName = "auth";

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    };

    res.clearCookie(cookieName, cookieOptions);

    return res.status(200).json({ Status: "Success", message: "Logged out" });
  } catch (err) {
    console.error("[LOGOUT] error:", err);
    return res.status(500).json({
      Status: "Error",
      Error: "Logout failed",
      detail: String(err),
    });
  }
};
