const express = require("express");
const prisma = require("../prismaClient");
const { authenticate, authorizeAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

/**
 * Create Department (ADMIN)
 */
router.post(
  "/departments",
  authenticate,
  authorizeAdmin,
  async (req, res) => {
    try {
      const { name, code } = req.body;

      if (!name || !code) {
        return res.status(400).json({ message: "Name and code are required" });
      }

      const department = await prisma.department.create({
        data: { name, code },
      });

      res.status(201).json(department);
    } catch (error) {
      if (error.code === "P2002") {
        return res
          .status(409)
          .json({ message: "Department already exists" });
      }
      res.status(500).json({ message: "Failed to create department" });
    }
  }
);

/**
 * List Departments (ADMIN)
 */
router.get(
  "/departments",
  authenticate,
  authorizeAdmin,
  async (req, res) => {
    const departments = await prisma.department.findMany();
    res.json(departments);
  }
);

module.exports = router;
