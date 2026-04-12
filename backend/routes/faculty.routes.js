const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");
const { authenticate } = require("../middlewares/auth.middleware");

router.get("/timetable/faculty", authenticate, async (req, res) => {
  try {
    // 🔑 facultyId must come from auth, not params
    const facultyId = req.user.facultyId;

    if (!facultyId) {
      return res.json({ generated: false, timetable: {} });
    }

    const entries = await prisma.timetableEntry.findMany({
      where: { facultyId },
      include: {
        course: true,
        room: true,
        timeSlot: true,
        batch: {
          include: {
            department: true,
          },
        },
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

    entries.forEach((e) => {
      const day = e.timeSlot.day;
      if (!timetable[day]) timetable[day] = [];

      timetable[day].push({
        time: `${e.timeSlot.startTime} - ${e.timeSlot.endTime}`,
        course: e.course.name,
        room: e.room.name,
        type: e.course.type,
        batch: `${e.batch.department.code} Sem ${e.batch.semester}`,
      });
    });

    res.json({ generated: true, timetable });
  } catch (error) {
    console.error("Faculty timetable error:", error);
    res.status(500).json({
      message: "Failed to fetch faculty timetable",
    });
  }
});

module.exports = router;
