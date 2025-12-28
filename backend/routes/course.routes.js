const express = require("express");
const prisma = require("../prismaClient");
const { authenticate, authorizeAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

/**
 * Create Course (ADMIN)
 */
router.post(
  "/courses",
  authenticate,
  authorizeAdmin,
  async (req, res) => {
    try {
      const { name, code, type, departmentId } = req.body;

      if (!name || !code || !type || !departmentId) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const course = await prisma.course.create({
        data: {
          name,
          code,
          type,
          departmentId,
          weeklyHours: weeklyHours ?? 4,
        },
      });

      res.status(201).json(course);
    } catch (error) {
      if (error.code === "P2002") {
        return res.status(409).json({ message: "Course code already exists" });
      }
      res.status(500).json({ message: "Failed to create course" });
    }
  }
);

/**
 * List Courses (ADMIN)
 */
router.get(
  "/courses",
  authenticate,
  authorizeAdmin,
  async (req, res) => {
    const courses = await prisma.course.findMany({
      include: {
        department: true,
      },
    });

    res.json(courses);
  }
);

module.exports = router;
