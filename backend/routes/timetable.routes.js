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
// backend/routes/timetable.routes.js

// Get timetable by Batch ID (Student View)
router.get("/batch/:batchId", authenticate, async (req, res) => {
  try {
    const { batchId } = req.params;
    const entries = await prisma.timetableEntry.findMany({
      where: { batchId: parseInt(batchId) },
      include: {
        course: true,
        faculty: true,
        room: true,
        timeSlot: true,
      }
    });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch student timetable" });
  }
});
router.post("/bulk-generate", authenticate, authorizeAdmin, async (req, res) => {
  const { batchId, courseId, facultyId, roomId } = req.body;

  try {
    const bId = parseInt(batchId);
    const cId = parseInt(courseId);
    const fId = parseInt(facultyId);
    const rId = parseInt(roomId);

    // 1. Fetch data and existing entries to find conflicts
    const [course, existingEntries, allSlots] = await Promise.all([
      prisma.course.findUnique({ where: { id: cId } }),
      prisma.timetableEntry.findMany({
        where: { OR: [{ batchId: bId }, { facultyId: fId }, { roomId: rId }] },
        select: { timeSlotId: true }
      }),
      prisma.timeSlot.findMany({ orderBy: [{ day: "asc" }, { startTime: "asc" }] })
    ]);

    if (!course) return res.status(404).json({ message: "Course not found" });
    
    const occupiedSlotIds = new Set(existingEntries.map(e => e.timeSlotId));
    const slotsToAssign = [];
    let hoursFound = 0;

    // 2. Greedy search for free slots
    for (const slot of allSlots) {
      if (hoursFound >= course.weeklyHours) break;

      if (!occupiedSlotIds.has(slot.id)) {
        slotsToAssign.push({
          batchId: bId, courseId: cId, facultyId: fId, roomId: rId, timeSlotId: slot.id
        });
        hoursFound++;
      }
    }

    if (hoursFound === 0) return res.status(400).json({ message: "No free slots found" });

    // 3. Perform Bulk Insert
    await prisma.timetableEntry.createMany({ data: slotsToAssign });

    res.status(201).json({ 
      message: `Successfully allocated ${hoursFound} hours for ${course.code}` 
    });

  } catch (error) {
    console.error("DEBUG - Bulk Error:", error); // LOOK AT YOUR TERMINAL FOR THIS
    res.status(500).json({ message: "Internal server error" });
  }
});
module.exports = router;