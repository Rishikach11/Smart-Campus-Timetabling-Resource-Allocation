const express = require("express");
const prisma = require("../prismaClient");
const { authenticate, authorizeAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

/**
 * Create Room (ADMIN)
 */
router.post(
  "/rooms",
  authenticate,
  authorizeAdmin,
  async (req, res) => {
    try {
      const { name, type, capacity } = req.body;

      if (!name || !type || !capacity) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const room = await prisma.room.create({
        data: {
          name,
          type,
          capacity,
        },
      });

      res.status(201).json(room);
    } catch (error) {
      if (error.code === "P2002") {
        return res.status(409).json({ message: "Room already exists" });
      }
      res.status(500).json({ message: "Failed to create room" });
    }
  }
);

/**
 * List Rooms (ADMIN)
 */
router.get(
  "/rooms",
  authenticate,
  authorizeAdmin,
  async (req, res) => {
    const rooms = await prisma.room.findMany();
    res.json(rooms);
  }
);

module.exports = router;
