import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changeUserRole,
  listUsers,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/:id/role", changeUserRole);
router.get("/admin", listUsers);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
