const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const faculties = await prisma.faculty.findMany();
  const timeSlots = await prisma.timeSlot.findMany({
    where: {
      startTime: {
        in: ["09:00", "10:00", "11:00", "12:00"],
      },
    },
  });

  for (const faculty of faculties) {
    for (const slot of timeSlots) {
      try {
        await prisma.facultyAvailability.create({
          data: {
            facultyId: faculty.id,
            timeSlotId: slot.id,
          },
        });
      } catch {
        // ignore duplicates
      }
    }
  }

  console.log("Faculty availability seeded");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
