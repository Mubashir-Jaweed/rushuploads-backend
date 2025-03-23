import type { Prisma } from "@prisma/client";

import path from "node:path";

import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";

import { env } from "../lib/env";
import { prisma } from "../lib/prisma";
import { s3Client } from "../lib/s3";

interface ChunkUploadMetadata {
  key: string;
  uploadId: string;
}

async function initiateMultipartUpload({ originalName, mimeType }) {
  try {
    const command = new CreateMultipartUploadCommand({
      Bucket: env.AWS_BUCKET,
      Key: originalName,
      ContentType: mimeType,
      // Explicitly disable checksums
      ChecksumAlgorithm: undefined
    });

    const response = await s3Client.send(command);
    return {
      key: response.Key,
      uploadId: response.UploadId
    };
  } catch (error) {
    console.error("Wasabi API Error:", error);
    throw new Error(`Upload initiation failed: ${error.message}`);
  }
}

async function uploadFileChunk(payload: {
  uploadMetadata: ChunkUploadMetadata;
  partNumber: number;
  body: Buffer;
}) {
  const uploadPartCommand = new UploadPartCommand({
    Bucket: env.AWS_BUCKET,
    Key: payload.uploadMetadata.key,
    UploadId: payload.uploadMetadata.uploadId,
    PartNumber: payload.partNumber,
    Body: payload.body,
    ChecksumAlgorithm:undefined
  });

  const uploadPartResponse = await s3Client.send(uploadPartCommand);

  return {
    partNumber: payload.partNumber,
    eTag: uploadPartResponse.ETag,
  };
}

async function completeMultipartUpload(payload: {
  uploadedParts: { PartNumber: number; ETag: string }[];
  uploadMetadata: ChunkUploadMetadata;
}) {
  const { uploadMetadata, uploadedParts } = payload;

  const completeUploadCommand = new CompleteMultipartUploadCommand({
    Bucket: env.AWS_BUCKET,
    Key: uploadMetadata.key,
    UploadId: uploadMetadata.uploadId,
    MultipartUpload: {
      Parts: uploadedParts,
    },
    
  });

  await s3Client.send(completeUploadCommand);

  return {
    key: uploadMetadata.key,
  };
}

async function removeFile(payload: { key: string }) {
  const deleteCommand = new DeleteObjectCommand({
    Bucket: env.AWS_BUCKET,
    Key: payload.key,
  });

  return await s3Client.send(deleteCommand);
}

async function getFilesByUserId(query: {
  userId: string;
  type?: string;
}) {
  const files = await prisma.file.findMany({
    where: {
      type: query.type,
      isDeleted: false,
      user: {
        id: query.userId,
      },
    },
    select: {
      id: true,
      originalName: true,
      name: true,
      type: true,
      downloads: true,
      claims: true,
      isExpired: true,
      isDeleted: true,
      expiredAt: true,
      updatedAt: true,
      user: {
        select: {
          email: true,
          profile: {
            select: {
              fullName: true,
            },
          },
        },
      },
      link: {
        select: {
          id: true,
        },
      },
    },
  });

  return { files };
}

async function getSharedFilesByUserId(query: {
  userId: string;
  type?: string;
}) {
  const user = await prisma.user.findUnique({
    where: {
      id: query.userId,
      sharedFiles: {
        every: {
          type: query.type,
          isDeleted: false,
        },
      },
    },
    select: {
      sharedFiles: {
        select: {
          id: true,
          originalName: true,
          name: true,
          type: true,
          downloads: true,
          claims: true,
          isExpired: true,
          isDeleted: true,
          expiredAt: true,
          updatedAt: true,
          user: {
            select: {
              email: true,
              profile: {
                select: {
                  fullName: true,
                },
              },
            },
          },
          link: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  return { files: user?.sharedFiles ?? [] };
}

async function createFiles(payload: {
  userId: string;
  expiresAt: Date;
  files: {
    originalName: string;
    name: string;
    type: string;
    size:number;
  }[];
  sharedToUserIds: string[];
}) {
  const files = await prisma.$transaction(
    payload.files.map((file) =>
      prisma.file.create({
        data: {
          originalName: file.originalName,
          name: file.name,
          type: file.type,
          size: file.size,
          expiredAt: payload.expiresAt,
          sharedToUsers: {
            connect: payload.sharedToUserIds.map((userId) => ({
              id: userId,
            })),
          },
          user: {
            connect: {
              id: payload.userId,
            },
          },
        },
        select: {
          id: true,
          originalName: true,
          name: true,
          type: true,
          size:true,
          downloads: true,
          claims: true,
          isExpired: true,
          isDeleted: true,
          expiredAt: true,
          updatedAt: true,
          user: {
            select: {
              email: true,
              profile: {
                select: {
                  fullName: true,
                },
              },
            },
          },
          link: {
            select: {
              id: true,
            },
          },
        },
      }),
    ),
  );

  return { files };
}

async function updateFileById(
  query: {
    fileId: string;
    userId?: string;
    type?: string;
  },
  payload: Prisma.FileUpdateInput,
) {
  const file = await prisma.file.update({
    where: {
      id: query.fileId,
      userId: query.userId,
      type: query.type,
    },
    data: payload,
    select: {
      id: true,
      originalName: true,
      name: true,
      type: true,
      size:true,
      downloads: true,
      claims: true,
      isExpired: true,
      isDeleted: true,
      expiredAt: true,
      updatedAt: true,
      user: {
        select: {
          email: true,
          profile: {
            select: {
              fullName: true,
            },
          },
        },
      },
      link: {
        select: {
          id: true,
        },
      },
    },
  });

  return { file };
}

export {
  initiateMultipartUpload,
  uploadFileChunk,
  completeMultipartUpload,
  getFilesByUserId,
  getSharedFilesByUserId,
  removeFile,
  createFiles,
  updateFileById,
};
