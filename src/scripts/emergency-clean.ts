// src/scripts/emergency-clean.ts
import { prisma } from "../lib/prisma";

async function emergencyClean() {
  // Delete invalid Setting documents
  await prisma.setting.deleteMany({
    where: {
      OR: [
        { createdAt: null },
        { createdAt: { lte: new Date('1970-01-01') } }
      ]
    }
  });

  // Add similar cleanup for other collections
  console.log("Emergency cleanup completed!");
}

emergencyClean()
  .catch(console.error)
  .finally(() => prisma.$disconnect());