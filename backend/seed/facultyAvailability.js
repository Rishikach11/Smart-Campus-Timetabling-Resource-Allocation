const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {

  // 🔥 CLEAR EXISTING DATA FIRST
  await prisma.facultyAvailability.deleteMany();

  const faculties = await prisma.faculty.findMany();

  const slots = await prisma.timeSlot.findMany({
    orderBy: [
      { day: "asc" },
      { startTime: "asc" },
    ],
  });

  for (const faculty of faculties) {
  await prisma.facultyAvailability.deleteMany({
    where: { facultyId: faculty.id }
  });

  for (const slot of slots) {
    if (["09:00", "10:00", "11:00", "12:00"].includes(slot.startTime)) {
      await prisma.facultyAvailability.create({
        data: {
          facultyId: faculty.id,
          timeSlotId: slot.id,
        },
      });
    }
  }
}


  console.log("Faculty availability reseeded cleanly");
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
  });
