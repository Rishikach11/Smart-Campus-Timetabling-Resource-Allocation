const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const days = ["MON", "TUE", "WED", "THU", "FRI"];
  const slots = [
    ["09:00", "10:00"],
    ["10:00", "11:00"],
    ["11:00", "12:00"],
    ["12:00", "13:00"],
    ["14:00", "15:00"],
    ["15:00", "16:00"],
  ];

  for (const day of days) {
    for (const [start, end] of slots) {
      await prisma.timeSlot.create({
        data: { day, startTime: start, endTime: end },
      });
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
  });
