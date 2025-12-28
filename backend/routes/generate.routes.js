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
    
    await prisma.timetableEntry.deleteMany({
        where: { batchId },
    });


    const courses = await prisma.course.findMany({
      where: { departmentId: batch.departmentId },
    });

    const timeSlots = await prisma.timeSlot.findMany();
    const rooms = await prisma.room.findMany();

    const created = [];

    for (const course of courses) {
      for (const slot of timeSlots) {
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

            created.push({ course: course.name, slot: slot.id });
            break;
          } catch {
            continue;
          }
        }
        if (created.find(c => c.course === course.name)) break;
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
