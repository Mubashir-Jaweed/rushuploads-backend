// src/scripts/final-data-clean.ts
import { prisma } from "../lib/prisma";

async function main() {
  // Delete AdViews with null createdAt
  await prisma.$runCommandRaw({
    delete: "AdView",
    deletes: [{
      q: { createdAt: null },
      limit: 0
    }]
  });

  // Delete AdClicks with null createdAt
  await prisma.$runCommandRaw({
    delete: "AdClick",
    deletes: [{
      q: { createdAt: null },
      limit: 0
    }]
  });

  console.log("Invalid records cleaned successfully");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());