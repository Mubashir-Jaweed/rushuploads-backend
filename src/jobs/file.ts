import { prisma } from "../lib/prisma";
import { removeFile } from "../services/file";

async function markExpiredFiles() {
  const now = new Date();

  const expiredFiles = await prisma.file.updateMany({
    where: {
      expiredAt: {
        lte: now,
      },
    },
    data: {
      isExpired: true,
    },
  });

  console.log(`${expiredFiles.count} files expired.`);
}

async function cleanupFiles() {
  const files = await prisma.file.findMany({
    where: {
      OR: [
        {
          isExpired: true,
        },
        {
          isDeleted: true,
        },
      ],
    },
  });

  for (const file of files) {
    try {
      await removeFile({ key: file.name });

      console.log(`File ${file.name} deleted from S3.`);
    } catch (error) {
      console.error(`Error deleting file ${file.name} from S3:`, error);
    }
  }

  console.log(`${files.length} files cleaned up.`);
}

export { markExpiredFiles, cleanupFiles };
