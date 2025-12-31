const express = require("express");
const prisma = require("../prismaClient");
const { authenticate, authorizeAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post(
  "/generate/batch/:batchId",
  authenticate,
  authorizeAdmin,
  async (req, res) => {
    const batchId = parseInt(req.params.batchId);

    try {
      // Use $transaction to ensure the deletion and creation happen together
      const result = await prisma.$transaction(async (tx) => {
        
        const batch = await tx.batch.findUnique({
          where: { id: batchId },
          include: { department: true },
        });

        if (!batch) {
          throw new Error("Batch not found");
        }

        // 1. Clear old timetable for this batch only
        await tx.timetableEntry.deleteMany({ where: { batchId } });

        // 2. Fetch necessary data using the transaction client 'tx'
        const courses = await tx.course.findMany({
          where: { departmentId: batch.departmentId },
        });

        const timeSlots = await tx.timeSlot.findMany({
          orderBy: [{ day: "asc" }, { startTime: "asc" }],
        });

        const rooms = await tx.room.findMany();

        const created = [];
        const report = {};
        const facultyLoad = {};

        for (const course of courses) {
          // Safety check for Phase 1: Ensure faculty is assigned
          if (!course.facultyId) {
            throw new Error(`Course ${course.name} has no faculty assigned.`);
          }

          report[course.name] = {
            required: course.weeklyHours,
            scheduled: 0,
            reason: null,
          };

          let remainingHours = course.weeklyHours;
          if (!facultyLoad[course.facultyId]) {
            facultyLoad[course.facultyId] = 0;
          }

          // ---------------- LAB COURSES (Double Slots) ----------------
          if (course.type === "LAB") {
            const labRooms = rooms.filter(r => r.type === "LAB");

            for (let i = 0; i < timeSlots.length - 1; i++) {
              if (remainingHours <= 0 || facultyLoad[course.facultyId] >= 16) break;

              const slot1 = timeSlots[i];
              const slot2 = timeSlots[i + 1];

              if (slot1.day !== slot2.day) continue;

              const availability = await tx.facultyAvailability.findMany({
                where: {
                  facultyId: course.facultyId,
                  timeSlotId: { in: [slot1.id, slot2.id] },
                },
              });

              if (availability.length < 2) continue;

              const batchBusy = await tx.timetableEntry.findFirst({
                where: { batchId, timeSlotId: { in: [slot1.id, slot2.id] } },
              });
              if (batchBusy) continue;

              for (const room of labRooms) {
                const roomBusy = await tx.timetableEntry.findFirst({
                  where: { roomId: room.id, timeSlotId: { in: [slot1.id, slot2.id] } },
                });
                if (roomBusy) continue;

                await tx.timetableEntry.createMany({
                  data: [
                    { batchId, courseId: course.id, facultyId: course.facultyId, roomId: room.id, timeSlotId: slot1.id },
                    { batchId, courseId: course.id, facultyId: course.facultyId, roomId: room.id, timeSlotId: slot2.id },
                  ],
                });

                created.push(
                  { course: course.name, day: slot1.day, time: `${slot1.startTime}-${slot1.endTime}` },
                  { course: course.name, day: slot2.day, time: `${slot2.startTime}-${slot2.endTime}` }
                );

                remainingHours -= 2;
                facultyLoad[course.facultyId] += 2;
                report[course.name].scheduled += 2;
                break; 
              }
            }
          }

          // ---------------- THEORY COURSES (Single Slot) ----------------
          else {
            const days = ["MON", "TUE", "WED", "THU", "FRI"];
            for (const day of days) {
              if (remainingHours <= 0 || facultyLoad[course.facultyId] >= 16) break;

              const daySlots = timeSlots.filter(s => s.day === day);
              for (const slot of daySlots) {
                const isAvailable = await tx.facultyAvailability.findFirst({
                  where: { facultyId: course.facultyId, timeSlotId: slot.id },
                });
                if (!isAvailable) continue;

                const batchBusy = await tx.timetableEntry.findFirst({
                  where: { batchId, timeSlotId: slot.id },
                });
                if (batchBusy) continue;

                for (const room of rooms.filter(r => r.type === "CLASSROOM")) {
                  const roomBusy = await tx.timetableEntry.findFirst({
                    where: { roomId: room.id, timeSlotId: slot.id },
                  });
                  if (roomBusy) continue;

                  await tx.timetableEntry.create({
                    data: { batchId, courseId: course.id, facultyId: course.facultyId, roomId: room.id, timeSlotId: slot.id },
                  });

                  created.push({ course: course.name, day: slot.day, time: `${slot.startTime}-${slot.endTime}` });
                  remainingHours--;
                  facultyLoad[course.facultyId]++;
                  report[course.name].scheduled++;
                  break; 
                }
                break; // One theory class per course per day [cite: 38]
              }
            }
          }

          if (report[course.name].scheduled < course.weeklyHours) {
            report[course.name].reason = "Insufficient availability or conflicts";
          }
        }

        return { report, createdCount: created.length, created };
      });

      res.json({
        message: "Timetable generation completed successfully",
        summary: result.report,
        entriesCreated: result.createdCount,
        details: result.created,
      });

    } catch (error) {
      console.error("Generation Error:", error.message);
      res.status(500).json({ 
        message: "Generation failed. Old timetable restored.", 
        error: error.message 
      });
    }
  }
);

module.exports = router;