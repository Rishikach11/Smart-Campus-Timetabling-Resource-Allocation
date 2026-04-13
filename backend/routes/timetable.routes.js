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
 * RESET BATCH TIMETABLE (ADMIN ONLY)
 * -----------------------------------------
 * Deletes ALL timetable entries for a batch.
 * Must be called before regeneration to avoid duplicate-slot conflicts.
 */
router.delete(
  "/batch/:batchId",
  authenticate,
  authorizeAdmin,
  async (req, res) => {
    try {
      const batchId = parseInt(req.params.batchId);

      if (isNaN(batchId)) {
        return res.status(400).json({ message: "Invalid batchId" });
      }

      const result = await prisma.timetableEntry.deleteMany({
        where: { batchId },
      });

      res.json({ batchId, deleted: result.count });
    } catch (error) {
      console.error("DELETE /timetable/batch/:batchId error:", error);
      res.status(500).json({ message: "Failed to reset batch timetable" });
    }
  }
);

module.exports = router;
