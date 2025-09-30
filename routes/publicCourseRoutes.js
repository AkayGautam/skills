import express from "express";
import Course from "../models/courseModel.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const courses = await Course.findAllPublished();
    res.json(courses);
  } catch (err) {
    console.error("publicCourseRoutes.list error:", err);
    res.status(500).json({ error: "server error" });
  }
});

 
router.get("/id/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findPublishedById(id);
    if (!course) return res.status(404).json({ error: "Course not available" });
    res.json(course);
  } catch (err) {
    console.error("publicCourseRoutes.id error:", err);
    res.status(500).json({ error: "server error" });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const course = await Course.findPublishedBySlug(slug);
    if (!course) return res.status(404).json({ error: "Course not available" });
    res.json(course);
  } catch (err) {
    console.error("publicCourseRoutes.slug error:", err);
    res.status(500).json({ error: "server error" });
  }
});

export default router;
