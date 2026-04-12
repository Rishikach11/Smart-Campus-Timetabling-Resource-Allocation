const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const departments = [
    { name: "Computer Science", code: "CS" },
    { name: "Electrical Engineering", code: "EE" }
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: {},
      create: dept,
    });
  }
  console.log("Departments seeded successfully");
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
  });