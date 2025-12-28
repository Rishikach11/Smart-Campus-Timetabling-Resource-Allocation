const express = require("express");
const prisma = require("../prismaClient");
const { authenticate, authorizeAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

/**
 * Create Faculty (ADMIN)
 */
router.post(
  "/faculty",
  authenticate,
  authorizeAdmin,
  async (req, res) => {
    try {
      const { name, email, maxLoad, departmentId } = req.body;

      if (!name || !email || !maxLoad || !departmentId) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const faculty = await prisma.faculty.create({
        data: {
          name,
          email,
          maxLoad,
          departmentId,
          maxWeeklyLoad: maxWeeklyLoad ?? 16,
        },
      });

      res.status(201).json(faculty);
    } catch (error) {
      if (error.code === "P2002") {
        return res.status(409).json({ message: "Faculty email already exists" });
      }
      res.status(500).json({ message: "Failed to create faculty" });
    }
  }
);

/**
 * List Faculty (ADMIN)
 */
router.get(
  "/faculty",
  authenticate,
  authorizeAdmin,
  async (req, res) => {
    const faculty = await prisma.faculty.findMany({
      include: {
        department: true,
      },
    });

    res.json(faculty);
  }
);

module.exports = router;
