const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting Master Seed...");

  console.log("🧹 Nuking existing data...");
  await prisma.timetableEntry.deleteMany();
  await prisma.user.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.course.deleteMany();
  await prisma.room.deleteMany();
  await prisma.department.deleteMany();
  await prisma.timeSlot.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);

  console.log("🏗️ Creating Core Structure...");
  const dept = await prisma.department.create({ 
    data: { name: "Computer Science", code: "CS" } 
  });

  const drSharma = await prisma.faculty.create({
    data: { 
      name: "Dr. Sharma", 
      email: "sharma@test.com", 
      maxLoad: 18, 
      maxWeeklyLoad: 16,
      departmentId: dept.id 
    }
  });

  const batch3 = await prisma.batch.create({
    data: { semester: 3, size: 60, departmentId: dept.id }
  });

  console.log("📅 Creating TimeSlots...");
  const days = ["MON", "TUE", "WED", "THU", "FRI"];
  const times = [
    { start: "09:00", end: "10:00" },
    { start: "10:00", end: "11:00" },
    { start: "11:00", end: "12:00" },
    { start: "12:00", end: "13:00" },
    { start: "14:00", end: "15:00" },
    { start: "15:00", end: "16:00" },
  ];

  for (const day of days) {
    for (const time of times) {
      await prisma.timeSlot.create({
        data: { day, startTime: time.start, endTime: time.end }
      });
    }
  }

  console.log("🏫 Creating Rooms and Courses...");
  await prisma.room.create({
    data: { 
      name: "C-101", 
      capacity: 60,
      type: "CLASSROOM",
      isLab: false 
    }
  });

  // REMOVED 'credits' because it is not in your schema
  await prisma.course.create({
    data: { 
      name: "Data Structures", 
      code: "CS201", 
      departmentId: dept.id,
      type: "THEORY",
      weeklyHours: 4 
    }
  });

  console.log("👤 Creating Users...");
  await prisma.user.create({
    data: { 
      name: "Dr. Sharma", 
      email: "sharma@test.com", 
      password: hashedPassword, 
      role: "FACULTY", 
      facultyId: drSharma.id 
    }
  });

  await prisma.user.create({
    data: { 
      name: "Student Test", 
      email: "student@test.com", 
      password: hashedPassword, 
      role: "STUDENT", 
      batchId: batch3.id 
    }
  });

  await prisma.user.create({
    data: { 
      name: "Admin", 
      email: "admin@test.com", 
      password: hashedPassword, 
      role: "ADMIN" 
    }
  });

  console.log("✅ Seed successful!");
}

main()
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });