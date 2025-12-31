const express = require("express");
const prisma = require("../prismaClient"); // Ensure this matches your project structure
const { authenticate, authorizeAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

/**
 * @route   GET /api/timetable/timeslots
 * @desc    Fetch all available time slots for dropdowns
 */
router.get("/timeslots", authenticate, async (req, res) => {
  try {
    const slots = await prisma.timeSlot.findMany({
      orderBy: [
        { day: "asc" },
        { startTime: "asc" }
      ],
    });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch time slots" });
  }
});

/**
 * @route   POST /api/timetable/manual
 * @desc    Create Timetable Entry with Manual Slot Selection (ADMIN)
 */
router.post("/manual", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { batchId, courseId, facultyId, roomId, timeSlotId } = req.body;

    if (!batchId || !courseId || !facultyId || !roomId || !timeSlotId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 1. Fetch related entities to check constraints
    const [batch, course, faculty, room] = await Promise.all([
      prisma.batch.findUnique({ where: { id: parseInt(batchId) } }),
      prisma.course.findUnique({ where: { id: parseInt(courseId) } }),
      prisma.faculty.findUnique({ where: { id: parseInt(facultyId) } }),
      prisma.room.findUnique({ where: { id: parseInt(roomId) } }),
    ]);

    if (!batch || !course || !faculty || !room) {
      return res.status(404).json({ message: "Invalid references" });
    }

    // 2. Room Type Validation
    if (course.type === "LAB" && room.type !== "LAB") {
      return res.status(400).json({ message: "LAB course requires LAB room" });
    }
    if (course.type === "THEORY" && room.type !== "CLASSROOM") {
      return res.status(400).json({ message: "THEORY course requires CLASSROOM" });
    }

    // 3. Capacity Check
    if (batch.size > room.capacity) {
      return res.status(400).json({ message: "Room capacity insufficient" });
    }

    // 4. Conflict Checks (Faculty, Batch, Room)
    const conflicts = await prisma.timetableEntry.findFirst({
      where: {
        timeSlotId: parseInt(timeSlotId),
        OR: [
          { facultyId: parseInt(facultyId) },
          { batchId: parseInt(batchId) },
          { roomId: parseInt(roomId) }
        ]
      }
    });

    if (conflicts) {
      return res.status(409).json({ message: "Time conflict: Faculty, Batch, or Room is already booked." });
    }

    // 5. Create Entry
    const entry = await prisma.timetableEntry.create({
      data: {
        batchId: parseInt(batchId),
        courseId: parseInt(courseId),
        facultyId: parseInt(facultyId),
        roomId: parseInt(roomId),
        timeSlotId: parseInt(timeSlotId),
      },
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create timetable entry" });
  }
});

/**
 * @route   POST /api/timetable/generate
 * @desc    Smart Allocation: Automatically find a free slot (ADMIN)
 */
router.post("/generate", authenticate, authorizeAdmin, async (req, res) => {
  const { batchId, courseId, facultyId, roomId } = req.body;

  try {
    const allSlots = await prisma.timeSlot.findMany();
    let assignedSlot = null;

    // Greedy Search: Find first available slot with no conflicts
    for (const slot of allSlots) {
      const conflict = await prisma.timetableEntry.findFirst({
        where: {
          timeSlotId: slot.id,
          OR: [
            { batchId: parseInt(batchId) },
            { facultyId: parseInt(facultyId) },
            { roomId: parseInt(roomId) }
          ]
        }
      });

      if (!conflict) {
        assignedSlot = slot;
        break; 
      }
    }

    if (!assignedSlot) {
      return res.status(400).json({ message: "No available slots found for this combination." });
    }

    const entry = await prisma.timetableEntry.create({
      data: {
        batchId: parseInt(batchId),
        courseId: parseInt(courseId),
        facultyId: parseInt(facultyId),
        roomId: parseInt(roomId),
        timeSlotId: assignedSlot.id
      },
      include: { timeSlot: true, course: true, faculty: true, room: true }
    });

    res.status(201).json({ message: "Smart allocation successful!", entry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Automatic generation failed." });
  }
});
// backend/routes/timetable.routes.js

router.get("/all", authenticate, async (req, res) => {
  try {
    const entries = await prisma.timetableEntry.findMany({
      include: {
        course: true,
        faculty: true,
        room: true,
        timeSlot: true,
        batch: true
      }
    });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch timetable" });
  }
});

module.exports = router;