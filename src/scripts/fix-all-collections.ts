import { prisma } from "../lib/prisma";

async function main() {

  console.log('Starting database cleanup...');
  
  // Fix Setting collection
  console.log('Updating Setting collection...');
  const settingResult = await prisma.$runCommandRaw({
    update: "Setting",
    updates: [{
      q: { createdAt: null },
      u: { $set: { createdAt: new Date() } },
      multi: true
    }]
  });
  console.log('Settings updated:', settingResult);

  // Fix Setting collection
  await prisma.$runCommandRaw({
    update: "Setting",
    updates: [{
      q: { createdAt: null },
      u: { $set: { createdAt: new Date() } },
      multi: true
    }]
  });

  // Fix AdView collection
  await prisma.$runCommandRaw({
    update: "AdView",
    updates: [{
      q: { createdAt: null },
      u: { $set: { createdAt: new Date() } },
      multi: true
    }]
  });

  // Fix AdClick collection
  await prisma.$runCommandRaw({
    update: "AdClick",
    updates: [{
      q: { createdAt: null },
      u: { $set: { createdAt: new Date() } },
      multi: true
    }]
  });
  console.log('Database cleanup completed!');
}

main()
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());