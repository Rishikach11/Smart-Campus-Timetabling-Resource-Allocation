const express = require("express");
const prisma = require("../prismaClient");
const { authenticate, authorizeAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

/**
 * Generate timetable for ONE batch
 */
router.post(
  "/generate/batch/:batchId",
  authenticate,
  authorizeAdmin,
  async (req, res) => {
    const batchId = parseInt(req.params.batchId);

    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: { department: true },
    });

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    // Clear existing timetable
    await prisma.timetableEntry.deleteMany({
      where: { batchId },
    });

    const courses = await prisma.course.findMany({
      where: { departmentId: batch.departmentId },
    });

    const timeSlots = await prisma.timeSlot.findMany();
    const rooms = await prisma.room.findMany();

    const created = [];
    const facultyLoad = {};

    for (const course of courses) {
      let remainingHours = course.weeklyHours;
      const usedDays = new Set();

      if (!facultyLoad[course.facultyId]) {
        facultyLoad[course.facultyId] = 0;
      }

      const days = ["MON", "TUE", "WED", "THU", "FRI"];

      for (const day of days) {
        if (remainingHours === 0) break;
        if (facultyLoad[course.facultyId] >= 16) break;

        const daySlots = timeSlots.filter(slot => slot.day === day);

        for (const slot of daySlots) {
          const isAvailable = await prisma.facultyAvailability.findFirst({
            where: {
              facultyId: course.facultyId,
              timeSlotId: slot.id,
            },
          });

if (!isAvailable) {
  continue; // faculty not available in this slot
}

          for (const room of rooms) {
            try {
              await prisma.timetableEntry.create({
                data: {
                  batchId,
                  courseId: course.id,
                  facultyId: course.facultyId,
                  roomId: room.id,
                  timeSlotId: slot.id,
                },
              });

              created.push({
                course: course.name,
                day: slot.day,
                time: `${slot.startTime}-${slot.endTime}`,
              });

              remainingHours--;
              facultyLoad[course.facultyId]++;
              break;
            } catch {
              continue;
            }
          }
          break; // VERY IMPORTANT: only one slot per day
        }
      }
    }

    res.json({
      message: "Timetable generated",
      entriesCreated: created.length,
      details: created,
    });
  }
);

module.exports = router;
