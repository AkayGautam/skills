// controllers/adminController.js
import bcrypt from "bcryptjs";
import { createUser } from "../models/userModel.js"; 

export const createAdminUser = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ Error: "name, email and password required" });
    }

    const hashed = await bcrypt.hash(password.toString(), 10);
    const [result] = await createUser(name, email, hashed, "admin");
    return res.status(201).json({ Status: "Success", insertedId: result.insertId });
  } catch (err) {
    return res.status(500).json({ Error: String(err) });
  }
};
