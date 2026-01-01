const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt"); // npm install bcrypt
const prisma = new PrismaClient();

async function main() {
  console.log("Nuking existing data...");
  // Order matters for Foreign Key constraints
  await prisma.timetableEntry.deleteMany();
  await prisma.facultyAvailability.deleteMany();
  await prisma.user.deleteMany();
  await prisma.course.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.room.deleteMany();
  await prisma.department.deleteMany();
  
  console.log("Seeding fresh campus data...");

  // 1. Department
  const dept = await prisma.department.create({
    data: { name: "Computer Science", code: "CS" }
  });

  // 2. Faculty
  const faculty = await prisma.faculty.create({
    data: { 
      name: "Dr. Sharma", 
      email: "sharma@campus.edu", 
      maxLoad: 16, 
      departmentId: dept.id 
    }
  });

  // 3. Course
  const course = await prisma.course.create({
    data: { 
      name: "Data Structures", 
      code: "CS201", 
      type: "THEORY", 
      weeklyHours: 4, 
      departmentId: dept.id 
    }
  });

  // 4. Batch
  const batch3 = await prisma.batch.create({
    data: { semester: 3, size: 50, departmentId: dept.id }
  });
  


  // 5. Room
  await prisma.room.create({
    data: { name: "C-101", type: "CLASSROOM", capacity: 60 }
  });

  // 6. Users (Admin and Student)
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  // Student linked to Semester 3
  await prisma.user.create({
    data: {
      name: "Student Test",
      email: "student1@test.com",
      password: hashedPassword,
      role: "STUDENT",
      batchId: batch3.id 
    }
  });

  await prisma.user.create({
    data: {
      name: "Admin Test",
      email: "admin@test.com",
      password: hashedPassword,
      role: "ADMIN"
    }
  });

  console.log("Master Seed Complete. Users linked to Batches.");
}

main()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());