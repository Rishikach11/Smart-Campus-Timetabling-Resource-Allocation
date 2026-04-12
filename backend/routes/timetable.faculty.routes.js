const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");
const { authenticate } = require("../middlewares/auth.middleware");

router.get("/timetable/faculty/:facultyId", authenticate, async (req, res) => {
  const facultyId = parseInt(req.params.facultyId);

  const entries = await prisma.timetableEntry.findMany({
    where: { facultyId },
    include: {
      course: true,
      room: true,
      timeSlot: true,
    },
    orderBy: {
      timeSlot: { startTime: "asc" },
    },
  });

  if (entries.length === 0) {
    return res.json({ generated: false });
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
    });
  });

  res.json({ generated: true, timetable });
});

module.exports = router;
