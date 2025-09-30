import express from "express";
import { changeUserRole, listUsers } from "../controllers/userController.js";
import { createAdminUser } from "../controllers/adminController.js";
import { requireAuth, requireRole } from "../middleware/auth.js"; 
import db from "../db.js";


const router = express.Router();
router.post("/create-user", requireAuth, requireRole("admin"), createAdminUser);

router.post("/users/:id/role", changeUserRole);
router.get("/users", listUsers);

router.get("/stats", requireAuth, requireRole("admin"), async (req, res) => {
  try {
 
    const [usersCountRows] = await db.query("SELECT COUNT(*) AS totalUsers FROM users");
    const totalUsers = usersCountRows?.[0]?.totalUsers ?? 0;

 
    let totalBlogs = 0;
    try {
      const [blogsCountRows] = await db.query("SELECT COUNT(*) AS totalBlogs FROM blogs");
      totalBlogs = blogsCountRows?.[0]?.totalBlogs ?? 0;
    } catch (err) {
      totalBlogs = 0;
    }

    const [recentUsers] = await db.query(
      "SELECT id, name, email, role FROM users ORDER BY id DESC LIMIT 5"
    );

    let recentBlogs = [];
    try {
      const [rows] = await db.query(
        "SELECT id, blogName, authorName FROM blogs ORDER BY id DESC LIMIT 5"
      );
      recentBlogs = rows;
    } catch (err) {
      try {
        const [rows2] = await db.query(
          "SELECT id, title AS blogName, author AS authorName FROM blogs ORDER BY id DESC LIMIT 5"
        );
        recentBlogs = rows2;
      } catch (err2) { 
        recentBlogs = [];
      }
    }

    //console.log("[ADMIN /stats] response OK");
    return res.json({ totalUsers, totalBlogs, recentUsers, recentBlogs });
  } catch (err) {
   // console.error("[ADMIN /stats error]", err?.stack || err?.message || err);
    return res.status(500).json({ error: "Failed to load stats", detail: String(err.message || err) });
  }
});

export default router;  
