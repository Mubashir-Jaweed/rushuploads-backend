import { prisma } from "../src/lib/prisma";

async function main() {
  // Add createdAt to existing documents
  await prisma.setting.updateMany({
    where: { createdAt: null },
    data: { createdAt: new Date() }
  });

  // Add updatedAt to existing documents
  await prisma.setting.updateMany({
    where: { updatedAt: null },
    data: { updatedAt: new Date() }
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());