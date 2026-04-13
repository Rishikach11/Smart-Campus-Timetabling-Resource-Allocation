const express = require("express");
const bcrypt = require("bcrypt");
const prisma = require("../prismaClient");
const { authenticate, authorizeAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

/**
 * Create User — ADMIN only.
 * Used for provisioning accounts outside of the seed script.
 */
router.post("/users", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "name, email, password, and role are required" });
    }

    const valid = ["ADMIN", "FACULTY", "STUDENT"];
    if (!valid.includes(role)) {
      return res.status(400).json({ message: `role must be one of: ${valid.join(", ")}` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    res.status(201).json(user);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "A user with that email already exists" });
    }
    console.error("User creation error:", error);
    res.status(500).json({ message: "User creation failed" });
  }
});

/**
 * GET /api/me — returns the authenticated user's profile.
 * Password field is explicitly excluded via Prisma select.
 */
router.get("/me", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        batchId: true,
        facultyId: true,
        createdAt: true,
        faculty: true,
        batch: {
          include: { department: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("GET /me error:", error);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
});

module.exports = router;
