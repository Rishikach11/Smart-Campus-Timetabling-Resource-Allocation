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

    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: { department: true },
    });

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    // Clear old timetable
    await prisma.timetableEntry.deleteMany({ where: { batchId } });

    const courses = await prisma.course.findMany({
      where: { departmentId: batch.departmentId },
    });

    const timeSlots = await prisma.timeSlot.findMany({
      orderBy: [{ day: "asc" }, { startTime: "asc" }],
    });

    const rooms = await prisma.room.findMany();

    const created = [];
    const report = {};
    const facultyLoad = {};

    for (const course of courses) {
      report[course.name] = {
        required: course.weeklyHours,
        scheduled: 0,
        reason: null,
      };

      let remainingHours = course.weeklyHours;

      if (!facultyLoad[course.facultyId]) {
        facultyLoad[course.facultyId] = 0;
      }

      // ---------------- LAB COURSES ----------------
      if (course.type === "LAB") {
        if (remainingHours % 2 !== 0) continue;

        const labRooms = rooms.filter(r => r.type === "LAB");

        for (let i = 0; i < timeSlots.length - 1; i++) {
          if (remainingHours === 0) break;
          if (facultyLoad[course.facultyId] >= 16) break;

          const slot1 = timeSlots[i];
          const slot2 = timeSlots[i + 1];

          // must be same day and consecutive
          if (slot1.day !== slot2.day) continue;

          // faculty available in both slots?
          const availability = await prisma.facultyAvailability.findMany({
            where: {
              facultyId: course.facultyId,
              timeSlotId: { in: [slot1.id, slot2.id] },
            },
          });

          if (availability.length < 2) continue;

          // batch free?
          const batchBusy = await prisma.timetableEntry.findFirst({
            where: {
              batchId,
              timeSlotId: { in: [slot1.id, slot2.id] },
            },
          });
          if (batchBusy) continue;

          for (const room of labRooms) {
            const roomBusy = await prisma.timetableEntry.findFirst({
              where: {
                roomId: room.id,
                timeSlotId: { in: [slot1.id, slot2.id] },
              },
            });
            if (roomBusy) continue;

            // create BOTH entries
            await prisma.timetableEntry.createMany({
              data: [
                {
                  batchId,
                  courseId: course.id,
                  facultyId: course.facultyId,
                  roomId: room.id,
                  timeSlotId: slot1.id,
                },
                {
                  batchId,
                  courseId: course.id,
                  facultyId: course.facultyId,
                  roomId: room.id,
                  timeSlotId: slot2.id,
                },
              ],
            });

            created.push(
              {
                course: course.name,
                day: slot1.day,
                time: `${slot1.startTime}-${slot1.endTime}`,
              },
              {
                course: course.name,
                day: slot2.day,
                time: `${slot2.startTime}-${slot2.endTime}`,
              }
            );

            remainingHours -= 2;
            facultyLoad[course.facultyId] += 2;
            report[course.name].scheduled += 2;
            break;
          }
        }
      }

      // ---------------- THEORY COURSES ----------------
      else {
        const days = ["MON", "TUE", "WED", "THU", "FRI"];

        for (const day of days) {
          if (remainingHours === 0) break;
          if (facultyLoad[course.facultyId] >= 16) break;

          const daySlots = timeSlots.filter(s => s.day === day);

          for (const slot of daySlots) {
            const isAvailable = await prisma.facultyAvailability.findFirst({
              where: {
                facultyId: course.facultyId,
                timeSlotId: slot.id,
              },
            });
            if (!isAvailable) continue;

            const batchBusy = await prisma.timetableEntry.findFirst({
              where: { batchId, timeSlotId: slot.id },
            });
            if (batchBusy) continue;

            for (const room of rooms) {
              const roomBusy = await prisma.timetableEntry.findFirst({
                where: { roomId: room.id, timeSlotId: slot.id },
              });
              if (roomBusy) continue;

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
              report[course.name].scheduled++;
              break;
            }
            break; // one theory class per day
          }
        }
      }
      if (report[course.name].scheduled < course.weeklyHours) {
        report[course.name].reason = "Insufficient availability or conflicts";
      }

    }

    res.json({
      message: "Timetable generation completed",
      summary: report,
      entriesCreated: created.length,
      details: created,
    });

  }
);

module.exports = router;
