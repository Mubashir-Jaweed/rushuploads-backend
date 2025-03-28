// src/scripts/convert-datetime.ts
import { prisma } from "../lib/prisma";

async function convertDateTimeFields() {
  // Convert Setting collection
  await prisma.$runCommandRaw({
    update: "Setting",
    updates: [{
      q: { createdAt: { $type: "string" } },
      u: [{
        $set: {
          createdAt: {
            $toDate: "$createdAt"
          }
        }
      }],
      multi: true
    }]
  });

  // Repeat for AdView and AdClick collections
  console.log("DateTime conversions completed!");
}

convertDateTimeFields()
  .catch(console.error)
  .finally(() => prisma.$disconnect());