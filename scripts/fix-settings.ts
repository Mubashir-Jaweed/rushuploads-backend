import { prisma } from "../src/lib/prisma";

async function main() {
  // Find documents missing createdAt
  const settingsWithoutCreatedAt = await prisma.setting.findMany({
    where: { createdAt: null }
  });

  // Update each document
  for (const setting of settingsWithoutCreatedAt) {
    await prisma.setting.update({
      where: { id: setting.id },
      data: { createdAt: new Date() }
    });
  }

  // Find documents missing updatedAt
  const settingsWithoutUpdatedAt = await prisma.setting.findMany({
    where: { updatedAt: null }
  });

  // Update each document
  for (const setting of settingsWithoutUpdatedAt) {
    await prisma.setting.update({
      where: { id: setting.id },
      data: { updatedAt: new Date() }
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());