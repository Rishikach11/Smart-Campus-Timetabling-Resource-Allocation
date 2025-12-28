const express = require("express");
const prisma = require("../prismaClient");
const { authenticate, authorizeAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

/**
 * Create Batch (ADMIN)
 */
router.post(
  "/batches",
  authenticate,
  authorizeAdmin,
  async (req, res) => {
    try {
      const { semester, size, departmentId } = req.body;

      if (!semester || !size || !departmentId) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const batch = await prisma.batch.create({
        data: {
          semester,
          size,
          departmentId,
        },
      });

      res.status(201).json(batch);
    } catch (error) {
      res.status(500).json({ message: "Failed to create batch" });
    }
  }
);

/**
 * List Batches (ADMIN)
 */
router.get(
  "/batches",
  authenticate,
  authorizeAdmin,
  async (req, res) => {
    const batches = await prisma.batch.findMany({
      include: {
        department: true,
      },
    });

    res.json(batches);
  }
);

module.exports = router;
