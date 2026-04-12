const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // 1. Clear Data (Order matters due to FK constraints)
  await prisma.timetableEntry.deleteMany();
  await prisma.facultyAvailability.deleteMany();
  await prisma.course.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.room.deleteMany();
  // Keep Department and TimeSlots as they are static.

  // 2. Bulk Rooms (Mix of Theory and Labs)
  const rooms = [
    { name: "L-101", type: "CLASSROOM", capacity: 60 },
    { name: "L-102", type: "CLASSROOM", capacity: 60 },
    { name: "C-Lab-1", type: "LAB", capacity: 30 },
    { name: "C-Lab-2", type: "LAB", capacity: 30 },
  ];
  await prisma.room.createMany({ data: rooms });

  // 3. Bulk Courses
  const courses = [
    { name: "Data Structures", code: "CS201", type: "THEORY", departmentId: 1, weeklyHours: 4 },
    { name: "DS Lab", code: "CS201L", type: "LAB", departmentId: 1, weeklyHours: 2 },
    { name: "Operating Systems", code: "CS301", type: "THEORY", departmentId: 1, weeklyHours: 3 },
    { name: "Algorithms", code: "CS302", type: "THEORY", departmentId: 1, weeklyHours: 4 },
  ];
  await prisma.course.createMany({ data: courses });

  console.log("Database bulk-seeded for stress testing.");
}

main().then(() => prisma.$disconnect());