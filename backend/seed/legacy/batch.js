const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const batch = await prisma.batch.upsert({
    where: { id: 1 },
    update: {},
    create: {
      semester: 4,
      size: 60,
      departmentId: 1 // Links to CS Department
    },
  });
  console.log(`Batch Created: Semester ${batch.semester} (ID: ${batch.id})`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => { console.error(e); prisma.$disconnect(); });