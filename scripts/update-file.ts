import { prisma } from "../src/lib/prisma";

const updateExistingFiles = async () => {
  const files = await prisma.file.findMany({
    where: {
      OR: [
        { downloadedAt: { equals: null } }, // Get files where downloadedAt is null
        { downloadedAt: { equals: [] } },   // Get files where downloadedAt is an empty array
      ],
    },
  });

  for (const file of files) {
    const updates: any = {};

    // Handle downloadedAt field if it's missing or empty
    if (!file.downloadedAt || file.downloadedAt.length === 0) {
      updates.downloadedAt = [];  // Set to an empty array if missing
    }

    // Handle downloadedBy field if it's missing
    if (!file.downloadedBy) {
      updates.downloadedBy = [];  // Set to an empty array if missing
    }

    // Update the file with the changes
    if (Object.keys(updates).length > 0) {
      await prisma.file.update({
        where: { id: file.id },
        data: updates,
      });
    }
  }
};

updateExistingFiles()
  .then(() => console.log('Existing files updated successfully!'))
  .catch((error) => console.error('Error updating files:', error));
