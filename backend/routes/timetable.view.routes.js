const express = require("express");
const prisma = require("../prismaClient");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

/**
 * View timetable for a batch (grouped by day)
 */
router.get(
  "/timetable/batch/:batchId",
  authenticate,
  async (req, res) => {
    const batchId = parseInt(req.params.batchId);

    const entries = await prisma.timetableEntry.findMany({
      where: { batchId },
      include: {
        course: { select: { name: true, type: true } },
        faculty: { select: { name: true } },
        room: { select: { name: true, type: true } },
        timeSlot: { select: { day: true, startTime: true, endTime: true } },
      },
    });

    const timetable = {};

    for (const entry of entries) {
      const day = entry.timeSlot.day;
      const time = `${entry.timeSlot.startTime}-${entry.timeSlot.endTime}`;

      if (!timetable[day]) {
        timetable[day] = [];
      }

      timetable[day].push({
        time,
        course: entry.course.name,
        faculty: entry.faculty.name,
        room: entry.room.name,
        type: entry.course.type,
      });
    }

    res.json(timetable);
  }
);

module.exports = router;
