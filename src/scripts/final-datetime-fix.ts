// src/scripts/final-datetime-fix.ts
import { prisma } from "../lib/prisma";

async function fixDateTime() {
  // Convert Setting collection
  await prisma.$runCommandRaw({
    update: "Setting",
    updates: [{
      q: { createdAt: { $type: "string" } },
      u: [{
        $set: {
          createdAt: {
            $convert: {
              input: "$createdAt",
              to: "date",
              onError: new Date(), // Fallback to current date
              onNull: new Date()
            }
          }
        }
      }],
      multi: true
    }]
  });

  console.log("DateTime conversion completed successfully!");
}

fixDateTime()
  .catch(console.error)
  .finally(() => prisma.$disconnect());