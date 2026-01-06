const express = require("express");
const prisma = require("../prismaClient");
const { authenticate, authorizeAdmin } = require("../middlewares/auth.middleware");
const router = express.Router();

// 1. Fetch all slots for the grid
router.get("/timeslots", authenticate, async (req, res) => {
  try {
    const slots = await prisma.timeSlot.findMany({ orderBy: [{ day: "asc" }, { startTime: "asc" }] });
    res.json(slots);
  } catch (error) { res.status(500).json({ message: "Error fetching slots" }); }
});

// ATOMIC BULK GENERATE
router.post("/bulk-generate", authenticate, authorizeAdmin, async (req, res) => {
  const { batchId, courseId, facultyId, roomId } = req.body;

  try {
    const bId = parseInt(batchId);
    const cId = parseInt(courseId);
    
    const course = await prisma.course.findUnique({ where: { id: cId } });
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Find slots where Batch, Faculty, and Room are ALL free
    const availableSlots = await prisma.timeSlot.findMany({
      where: {
        timetable: {
          none: {
            OR: [
              { batchId: bId },
              { facultyId: parseInt(facultyId) },
              { roomId: parseInt(roomId) }
            ]
          }
        }
      },
      take: course.weeklyHours
    });

    if (availableSlots.length < course.weeklyHours) {
      return res.status(400).json({ message: "Not enough free slots available." });
    }

    // THE FIX: Delete existing entries for this Course + Batch before creating new ones
    await prisma.$transaction([
      prisma.timetableEntry.deleteMany({
        where: { batchId: bId, courseId: cId }
      }),
      prisma.timetableEntry.createMany({
        data: availableSlots.map(slot => ({
          batchId: bId,
          courseId: cId,
          facultyId: parseInt(facultyId),
          roomId: parseInt(roomId),
          timeSlotId: slot.id
        }))
      })
    ]);

    res.status(201).json({ message: `Successfully allocated ${availableSlots.length} hours.` });
  } catch (error) {
    res.status(500).json({ message: "Bulk allocation failed." });
  }
});

// FIXED RESET ROUTE
router.delete("/batch/:batchId", authenticate, authorizeAdmin, async (req, res) => {
  try {
    await prisma.timetableEntry.deleteMany({
      where: { batchId: parseInt(req.params.batchId) }
    });
    res.json({ message: "Batch timetable cleared successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to reset batch." });
  }
});

// 4. FACULTY DASHBOARD ROUTE
router.get("/faculty/:facultyId", authenticate, async (req, res) => {
  try {
    const entries = await prisma.timetableEntry.findMany({
      where: { facultyId: parseInt(req.params.facultyId) },
      include: { batch: true, course: true, room: true, timeSlot: true }
    });
    res.json(entries);
  } catch (error) { res.status(500).json({ message: "Error fetching faculty schedule" }); }
});

module.exports = router;