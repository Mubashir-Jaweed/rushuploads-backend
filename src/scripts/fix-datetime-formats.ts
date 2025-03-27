import { prisma } from "../lib/prisma";

async function fixDateTimeFields() {
  // Fix Setting collection
  await prisma.$runCommandRaw({
    update: "Setting",
    updates: [{
      q: { 
        $or: [
          { createdAt: { $type: "string" } },
          { createdAt: { $exists: false } }
        ]
      },
      u: { 
        $set: { 
          createdAt: { 
            $dateFromString: {
              dateString: "$createdAt",
              timezone: "UTC"
            }
          } 
        } 
      },
      multi: true
    }]
  });

  // Repeat for AdView and AdClick collections
  console.log("DateTime fields converted successfully");
}

fixDateTimeFields()
  .catch(console.error)
  .finally(() => prisma.$disconnect());