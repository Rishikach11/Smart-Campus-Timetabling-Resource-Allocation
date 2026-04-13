const express = require("express");
const prisma = require("../prismaClient");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

/**
 * View timetable for a batch (grouped by day).
 * Accessible by any authenticated user — students see their own batch,
 * faculty see any batch, admins preview any batch.
 */
router.get("/timetable/batch/:batchId", authenticate, async (req, res) => {
  try {
    const batchId = parseInt(req.params.batchId);

    if (isNaN(batchId)) {
      return res.status(400).json({ message: "Invalid batchId" });
    }

    const entries = await prisma.timetableEntry.findMany({
      where: { batchId },
      include: {
        course: { select: { name: true, type: true } },
        faculty: { select: { name: true } },
        room: { select: { name: true, type: true } },
        timeSlot: { select: { day: true, startTime: true, endTime: true } },
      },
      orderBy: [
        { timeSlot: { day: "asc" } },
        { timeSlot: { startTime: "asc" } },
      ],
    });

    if (entries.length === 0) {
      return res.json({ generated: false, timetable: {} });
    }

    const timetable = {};

    for (const entry of entries) {
      const day = entry.timeSlot.day;
      const time = `${entry.timeSlot.startTime} - ${entry.timeSlot.endTime}`;

      if (!timetable[day]) timetable[day] = [];

      timetable[day].push({
        time,
        course: entry.course.name,
        faculty: entry.faculty.name,
        room: entry.room.name,
        type: entry.course.type,
      });
    }

    res.json({ generated: true, timetable });
  } catch (error) {
    console.error("GET /timetable/batch/:batchId error:", error);
    res.status(500).json({ message: "Failed to fetch timetable" });
  }
});

module.exports = router;
