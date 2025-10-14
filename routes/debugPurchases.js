// skillAdmin/routes/debugPurchases.js
import express from "express";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/purchases/complete", requireAuth, async (req, res) => {
  console.log("DEBUG PURCHASES: incoming req.body:", req.body);
  try {
    const userId = req.user?.id;
    if (!userId) {
      console.log("DEBUG PURCHASES: no user in req.user");
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    const {
      course_id = null,
      amount = 0,
      currency = "INR",
      payment_provider = "debug",
      payment_reference = null,
    } = req.body || {};

    if (!course_id) {
      console.log("DEBUG PURCHASES: missing course_id in body");
      return res.status(400).json({ success: false, error: "Missing course_id" });
    }

    // Optional: check DB connection working
    try {
      await pool.query("SELECT 1");
    } catch (dbErr) {
      console.error("DEBUG PURCHASES: DB test query failed:", dbErr);
      return res.status(500).json({ success: false, error: "DB connection error" });
    }

    // build insert
    const sql = `
      INSERT INTO user_purchases
      (user_id, course_id, amount, currency, payment_provider, payment_reference, status, purchased_at)
      VALUES (?, ?, ?, ?, ?, ?, 'completed', NOW())
    `;
    const values = [userId, course_id, amount, currency, payment_provider, payment_reference];

    console.log("DEBUG PURCHASES: running INSERT with values:", values);
    const [ins] = await pool.query(sql, values);
    console.log("DEBUG PURCHASES: inserted id:", ins.insertId);

    return res.json({ success: true, purchaseId: ins.insertId });
  } catch (err) {
    console.error("POST /api/debug/purchases/complete error:", err && err.stack ? err.stack : err);
    // return generic error to client; server console will have full trace
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;
