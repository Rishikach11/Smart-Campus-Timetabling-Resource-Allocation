const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const data = await prisma.facultyAvailability.findMany({
    include: {
      faculty: true,
      timeSlot: true,
    },
  });

  console.log(
    data.map(d => ({
      faculty: d.faculty.name,
      day: d.timeSlot.day,
      time: `${d.timeSlot.startTime}-${d.timeSlot.endTime}`,
    }))
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(console.error);
