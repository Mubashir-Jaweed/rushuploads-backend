// src/scripts/validate-datetime.ts
import { prisma } from "../lib/prisma";

async function validateDateTime() {
  // Find invalid Setting documents
  const invalidSettings = await prisma.$runCommandRaw({
    find: "Setting",
    filter: {
      $or: [
        { createdAt: { $type: "string" } },
        { createdAt: { $exists: false } }
      ]
    }
  });

  console.log('Invalid Setting documents:', invalidSettings.documents.length);
  
  // Add similar checks for AdView and AdClick collections
}

validateDateTime()
  .catch(console.error)
  .finally(() => prisma.$disconnect());