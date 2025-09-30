import express from "express";
import { register, login, logout  } from "../controllers/authController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login); 
router.post('/logout', logout);

router.get("/me", requireAuth, (req, res) => {
  res.json({
    authenticated: true,
    user: req.user, 
  });
});

export default router;
