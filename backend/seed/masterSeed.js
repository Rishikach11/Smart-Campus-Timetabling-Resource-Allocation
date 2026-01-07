const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// Import seed data
const departments = require("./data/departments");
const batches = require("./data/batches");
const facultyData = require("./data/faculty");
const courses = require("./data/courses");
const timeSlots = require("./data/timeslots");
const availability = require("./data/availability");
const users = require("./data/users");
const rooms = require("./data/rooms");

async function main() {
  console.log("🌱 Starting Master Seed (Dataset B)");

  // ----------------------------------
  // CLEAN DATABASE (SAFE ORDER)
  // ----------------------------------
  await prisma.timetableEntry.deleteMany();
  await prisma.facultyAvailability.deleteMany();
  await prisma.user.deleteMany();
  await prisma.course.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.department.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.room.deleteMany();

  // ----------------------------------
  // DEPARTMENTS
  // ----------------------------------
  await prisma.department.createMany({ data: departments });
  const deptRows = await prisma.department.findMany();

  const deptMap = {};
  deptRows.forEach((d) => (deptMap[d.code] = d.id));

  
  // ----------------------------------
  // ROOMS
  // ----------------------------------
  await prisma.room.createMany({ data: rooms });


  // ----------------------------------
  // BATCHES
  // ----------------------------------
  await prisma.batch.createMany({
    data: batches.map((b) => ({
      semester: b.semester,
      size: b.size,
      departmentId: deptMap[b.department],
    })),
  });

  const batchRows = await prisma.batch.findMany();

  // ----------------------------------
  // FACULTY
  // ----------------------------------
  await prisma.faculty.createMany({
    data: facultyData.map((f) => ({
      name: f.name,
      email: f.email,
      departmentId: deptMap[f.department],
      maxLoad: f.maxLoad,
      maxWeeklyLoad: f.maxWeeklyLoad,
    })),
  });

  const facultyRows = await prisma.faculty.findMany();
  const facultyMap = {};
  facultyRows.forEach((f) => (facultyMap[f.name] = f.id));

  // ----------------------------------
  // COURSES
  // ----------------------------------
  await prisma.course.createMany({
    data: courses.map((c) => ({
      name: c.name,
      code: c.code,
      type: c.type,
      weeklyHours: c.weeklyHours,
      facultyId: facultyMap[c.faculty],
      departmentId: deptMap[c.department],
    })),
  });

  // ----------------------------------
  // TIMESLOTS
  // ----------------------------------
  await prisma.timeSlot.createMany({ data: timeSlots });
  const slotRows = await prisma.timeSlot.findMany();

  // ----------------------------------
  // FACULTY AVAILABILITY
  // ----------------------------------
  await prisma.facultyAvailability.createMany({
    data: availability.flatMap((a) => {
      const facultyId = facultyMap[a.faculty];
      return slotRows
        .filter(
          (s) =>
            a.days.includes(s.day) &&
            a.slots.includes(s.startTime)
        )
        .map((s) => ({
          facultyId,
          timeSlotId: s.id,
        }));
    }),
  });

  // ----------------------------------
  // USERS
  // ----------------------------------
  const hashedPassword = await bcrypt.hash("password123", 10);

  await prisma.user.createMany({
    data: users.map((u) => ({
      name: u.name,
      email: u.email,
      password: hashedPassword,
      role: u.role,
      facultyId: u.faculty ? facultyMap[u.faculty] : null,
      batchId: u.batch
        ? batchRows.find(
            (b) =>
              b.semester === u.batch.semester &&
              deptMap[u.batch.department] === b.departmentId
          )?.id
        : null,
    })),
  });

  console.log("✅ Seed completed successfully (Dataset B)");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
