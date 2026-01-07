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
      const result = await prisma.$transaction(async (tx) => {

        const batch = await tx.batch.findUnique({
          where: { id: batchId },
          include: { department: true },
        });

        if (!batch) throw new Error("Batch not found");

        await tx.timetableEntry.deleteMany({ where: { batchId } });

        const courses = await tx.course.findMany({
          where: { departmentId: batch.departmentId },
          include: { faculty: true },
        });

        const timeSlots = await tx.timeSlot.findMany({
          orderBy: [{ day: "asc" }, { startTime: "asc" }],
        });

        const rooms = await tx.room.findMany();

        const facultyLoad = {};
        const report = {};
        const created = [];

        for (const course of courses) {

          if (!course.faculty) {
            throw new Error(`Course ${course.name} has no faculty assigned`);
          }

          const facultyId = course.faculty.id;
          facultyLoad[facultyId] ??= 0;

          report[course.name] = {
            required: course.weeklyHours,
            scheduled: 0,
            reason: null,
          };

          let remainingHours = course.weeklyHours;
          const maxLoad = course.faculty.maxWeeklyLoad;

          // ================= LAB COURSES =================
          if (course.type === "LAB") {
            const labRooms = rooms.filter(r => r.type === "LAB");

            for (let i = 0; i < timeSlots.length - 1; i++) {
              if (remainingHours <= 0 || facultyLoad[facultyId] >= maxLoad) break;

              const slot1 = timeSlots[i];
              const slot2 = timeSlots[i + 1];
              if (slot1.day !== slot2.day) continue;

              const availability = await tx.facultyAvailability.findMany({
                where: {
                  facultyId,
                  timeSlotId: { in: [slot1.id, slot2.id] },
                },
              });
              if (availability.length < 2) continue;

              const batchBusy = await tx.timetableEntry.findFirst({
                where: {
                  batchId,
                  timeSlotId: { in: [slot1.id, slot2.id] },
                },
              });
              if (batchBusy) continue;

              // 🔴 FACULTY CONFLICT CHECK (GLOBAL)
              const facultyBusy = await tx.timetableEntry.findFirst({
                where: {
                  facultyId,
                  timeSlotId: { in: [slot1.id, slot2.id] },
                },
              });
              if (facultyBusy) continue;

              for (const room of labRooms) {
                const roomBusy = await tx.timetableEntry.findFirst({
                  where: {
                    roomId: room.id,
                    timeSlotId: { in: [slot1.id, slot2.id] },
                  },
                });
                if (roomBusy) continue;

                await tx.timetableEntry.createMany({
                  data: [
                    { batchId, courseId: course.id, facultyId, roomId: room.id, timeSlotId: slot1.id },
                    { batchId, courseId: course.id, facultyId, roomId: room.id, timeSlotId: slot2.id },
                  ],
                });

                facultyLoad[facultyId] += 2;
                remainingHours -= 2;
                report[course.name].scheduled += 2;

                created.push(
                  { course: course.name, day: slot1.day, time: `${slot1.startTime}-${slot1.endTime}` },
                  { course: course.name, day: slot2.day, time: `${slot2.startTime}-${slot2.endTime}` }
                );
                break;
              }
            }
          }

          // ================= THEORY COURSES =================
          else {
            const days = ["MON", "TUE", "WED", "THU", "FRI"];

            for (const day of days) {
              if (remainingHours <= 0 || facultyLoad[facultyId] >= maxLoad) break;

              const daySlots = timeSlots.filter(s => s.day === day);

              for (const slot of daySlots) {
                const isAvailable = await tx.facultyAvailability.findFirst({
                  where: { facultyId, timeSlotId: slot.id },
                });
                if (!isAvailable) continue;

                const batchBusy = await tx.timetableEntry.findFirst({
                  where: { batchId, timeSlotId: slot.id },
                });
                if (batchBusy) continue;

                // 🔴 FACULTY CONFLICT CHECK (GLOBAL)
                const facultyBusy = await tx.timetableEntry.findFirst({
                  where: { facultyId, timeSlotId: slot.id },
                });
                if (facultyBusy) continue;

                for (const room of rooms.filter(r => r.type === "CLASSROOM")) {
                  const roomBusy = await tx.timetableEntry.findFirst({
                    where: { roomId: room.id, timeSlotId: slot.id },
                  });
                  if (roomBusy) continue;

                  await tx.timetableEntry.create({
                    data: {
                      batchId,
                      courseId: course.id,
                      facultyId,
                      roomId: room.id,
                      timeSlotId: slot.id,
                    },
                  });

                  facultyLoad[facultyId]++;
                  remainingHours--;
                  report[course.name].scheduled++;

                  created.push({
                    course: course.name,
                    day: slot.day,
                    time: `${slot.startTime}-${slot.endTime}`,
                  });

                  break;
                }
                break;
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
        message: "Timetable generated successfully",
        summary: result.report,
        entriesCreated: result.createdCount,
        details: result.created,
      });

    } catch (error) {
      console.error("Generation Error:", error.message);
      res.status(500).json({
        message: "Timetable generation failed",
        error: error.message,
      });
    }
  }
);

module.exports = router;
