const express = require("express");
const prisma = require("../prismaClient");
const {
  authenticate,
  authorizeAdmin,
} = require("../middlewares/auth.middleware");

const router = express.Router();

/**
 * -----------------------------------------
 * TIMESLOTS (READ-ONLY)
 * -----------------------------------------
 */
router.get("/timeslots", authenticate, async (req, res) => {
  try {
    const slots = await prisma.timeSlot.findMany({
      orderBy: [{ day: "asc" }, { startTime: "asc" }],
    });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: "Error fetching slots" });
  }
});

/**
 * -----------------------------------------
 * LEGACY / EXPERIMENTAL
 * ❌ NOT USED BY CURRENT ADMIN FLOW
 * ❌ DO NOT EXTEND WITHOUT REVISITING DESIGN
 * -----------------------------------------
 */
router.post("/bulk-generate", authenticate, authorizeAdmin, async (req, res) => {
  const { batchId, courseId, facultyId, roomId } = req.body;

  try {
    const bId = parseInt(batchId);
    const cId = parseInt(courseId);

    const course = await prisma.course.findUnique({
      where: { id: cId },
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const availableSlots = await prisma.timeSlot.findMany({
      where: {
        timetable: {
          none: {
            OR: [
              { batchId: bId },
              { facultyId: parseInt(facultyId) },
              { roomId: parseInt(roomId) },
            ],
          },
        },
      },
      take: course.weeklyHours,
    });

    if (availableSlots.length < course.weeklyHours) {
      return res
        .status(400)
        .json({ message: "Not enough free slots available" });
    }

    await prisma.$transaction([
      prisma.timetableEntry.deleteMany({
        where: { batchId: bId, courseId: cId },
      }),
      prisma.timetableEntry.createMany({
        data: availableSlots.map((slot) => ({
          batchId: bId,
          courseId: cId,
          facultyId: parseInt(facultyId),
          roomId: parseInt(roomId),
          timeSlotId: slot.id,
        })),
      }),
    ]);

    res.status(201).json({
      message: `Successfully allocated ${availableSlots.length} hours`,
    });
  } catch (error) {
    res.status(500).json({ message: "Bulk allocation failed" });
  }
});

/**
 * -----------------------------------------
 * RESET BATCH TIMETABLE (ADMIN ONLY)
 * -----------------------------------------
 * Deletes ALL timetable entries for a batch.
 * This must be called BEFORE regeneration.
 */
router.delete(
  "/batch/:batchId",
  authenticate,
  authorizeAdmin,
  async (req, res) => {
    try {
      const batchId = parseInt(req.params.batchId);

      const result = await prisma.timetableEntry.deleteMany({
        where: { batchId },
      });

      res.json({
        batchId,
        deleted: result.count,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to reset batch timetable",
      });
    }
  }
);

/**
 * -----------------------------------------
 * FACULTY TIMETABLE VIEW
 * -----------------------------------------
 */
router.get("/faculty/:facultyId", authenticate, async (req, res) => {
  try {
    const facultyId = parseInt(req.params.facultyId);

    const entries = await prisma.timetableEntry.findMany({
      where: { facultyId },
      include: {
        batch: true,
        course: true,
        room: true,
        timeSlot: true,
      },
    });

    res.json(entries);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching faculty schedule",
    });
  }
});

module.exports = router;
