const express = require("express");
const prisma = require("../prismaClient");
const { authenticate, authorizeAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

/**
 * Create Timetable Entry (ADMIN)
 */
router.post(
  "/timetable",
  authenticate,
  authorizeAdmin,
  async (req, res) => {
    try {
      const { batchId, courseId, facultyId, roomId, timeSlotId } = req.body;

      if (!batchId || !courseId || !facultyId || !roomId || !timeSlotId) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Fetch related entities
      const [batch, course, faculty, room] = await Promise.all([
        prisma.batch.findUnique({ where: { id: batchId } }),
        prisma.course.findUnique({ where: { id: courseId } }),
        prisma.faculty.findUnique({ where: { id: facultyId } }),
        prisma.room.findUnique({ where: { id: roomId } }),
      ]);

      if (!batch || !course || !faculty || !room) {
        return res.status(404).json({ message: "Invalid references" });
      }

      // Rule 4: LAB vs ROOM type
      if (course.type === "LAB" && room.type !== "LAB") {
        return res.status(400).json({ message: "LAB course requires LAB room" });
      }

      if (course.type === "THEORY" && room.type !== "CLASSROOM") {
        return res.status(400).json({ message: "THEORY course requires CLASSROOM" });
      }

      // Rule 5: Capacity check
      if (batch.size > room.capacity) {
        return res.status(400).json({ message: "Room capacity insufficient" });
      }

      // Rule 1: Faculty conflict
      const facultyClash = await prisma.timetableEntry.findFirst({
        where: { facultyId, timeSlotId },
      });

      if (facultyClash) {
        return res.status(409).json({ message: "Faculty time conflict" });
      }

      // Rule 2: Batch conflict
      const batchClash = await prisma.timetableEntry.findFirst({
        where: { batchId, timeSlotId },
      });

      if (batchClash) {
        return res.status(409).json({ message: "Batch time conflict" });
      }

      // Rule 3: Room conflict
      const roomClash = await prisma.timetableEntry.findFirst({
        where: { roomId, timeSlotId },
      });

      if (roomClash) {
        return res.status(409).json({ message: "Room time conflict" });
      }

      // Create timetable entry
      const entry = await prisma.timetableEntry.create({
        data: {
          batchId,
          courseId,
          facultyId,
          roomId,
          timeSlotId,
        },
      });

      res.status(201).json(entry);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to create timetable entry" });
    }
  }
);

module.exports = router;
