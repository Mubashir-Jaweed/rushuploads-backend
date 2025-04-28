import type { Request, Response } from "express";
import clamd from 'clamdjs';
import { TierConstraints } from "../constants/tiers";
import { env } from "../lib/env";
import { BadResponse, handleErrors } from "../lib/error";
import AWS from 'aws-sdk';
import {
  completeMultipartUpload,
  createFiles,
  getFilesByUserId,
  getSharedFilesByUserId,
  initiateMultipartUpload,
  updateFileById,
  uploadFileChunk,
} from "../services/file";
import { createLink, getLinkById } from "../services/link";
import { createMail, sendFiles } from "../services/mail";
import { updateUserById, upsertUserByEmail } from "../services/user";
import { validateFileConstraints } from "../utils/file";
import {
  deleteFileParamsSchema,
  generateFileLinkBodySchema,
  getLinkParamsSchema,
  sendFileMailBodySchema,
  updateFileParamsSchema,
} from "../validators/file";
import { S3Client, UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "@/lib/prisma";

const scanner = clamd.createScanner('127.0.0.1', 3310);

// async function startMultipartUpload(request: Request, response: Response) {
//   try {
//     const { originalName, mimeType } = request.body;

//     const { key, uploadId } = await initiateMultipartUpload({
//       originalName,
//       mimeType,
//     });

//     return response.success(
//       { data: { key, uploadId } },
//       { message: "Multipart upload initiated successfully!" },
//     );
//   } catch (error) {
//     return handleErrors({ response, error });
//   }
// }

// async function uploadChunk(request: Request, response: Response) {
//   try {
//     const { key, uploadId, chunkNumber } = request.body;

//     const chunk = request.file.buffer;

//     // const scanResult = await scanner.scanBuffer(chunk);
//     // if (!clamd.isCleanReply(scanResult)) {
//     //   return response.badRequest(
//     //     { data: {} },
//     //     { message: "File Contain Virus" },
//     //   );
//     // }

//     const { eTag } = await uploadFileChunk({
//       partNumber: chunkNumber,
//       body: chunk,
//       uploadMetadata: { key: key, uploadId: uploadId },
//     });

//     return response.success(
//       { data: { eTag } },
//       { message: "Chunk uploaded successfully!" },
//     );
//   } catch (error) {
//     return handleErrors({ response, error });
//   }
// }

// async function finalizeMultipartUpload(request: Request, response: Response) {
//   try {
//     const { key, uploadId, uploadedParts } = request.body;

//     await completeMultipartUpload({
//       uploadedParts,
//       uploadMetadata: { key, uploadId },
//     });

//     return response.success(
//       { data: {} },
//       {
//         message: "Multipart upload completed successfully!",
//       },
//     );
//   } catch (error) {
//     return handleErrors({ response, error });
//   }
// }

const s3 = new AWS.S3({
  accessKeyId: process.env.WASABI_ACCESS_KEY_ID,
  secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY,
  endpoint: process.env.WASABI_ENDPOINT,
  region: process.env.WASABI_REGION,
  signatureVersion: 'v4',
});


async function initiateUpload(request: Request, response: Response) {
  const { filename } = request.body;
  const params = {
    Bucket: process.env.WASABI_BUCKET,
    Key: filename,
  };

  const { UploadId } = await s3.createMultipartUpload(params).promise();
  response.status(200).json({ uploadId: UploadId });
}
async function presignedUrl(request: Request, response: Response) {
  const { partNumber, uploadId, filename } = request.body;

  

  const s3Client = new S3Client({
    region: process.env.WASABI_REGION,
    endpoint: process.env.WASABI_ENDPOINT,
    credentials: {
      accessKeyId: process.env.WASABI_ACCESS_KEY_ID,
      secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY,
    },
  });

  const command = new UploadPartCommand({
    Bucket: process.env.WASABI_BUCKET,
    Key: filename,
    PartNumber: Number(partNumber),
    UploadId: uploadId,
  }); 

  const signedUrl = await getSignedUrl(s3Client, command);

  response.status(200).json({ url: signedUrl });
}

async function completeMultiPart(request: Request, response: Response) {
  const { filename, uploadId, parts } = request.body;

  const s3 = new AWS.S3({
    accessKeyId: process.env.WASABI_ACCESS_KEY_ID,
    secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY,
    endpoint: process.env.WASABI_ENDPOINT,
    region: process.env.WASABI_REGION,
    signatureVersion: 'v4',
  });

  const params = {
    Bucket: process.env.WASABI_BUCKET,
    Key: filename,
    UploadId: uploadId,
    MultipartUpload: { Parts: parts },
  };

  const result = await s3.completeMultipartUpload(params).promise();
  response.status(200).json(result);
}


async function generateFileLink(request: Request, response: Response) {
  try {
    const { title, message, expiresInDays, files } =
      generateFileLinkBodySchema.parse(request.body);


    const rawFiles = [];

    const totalFileSize = rawFiles.reduce((acc, file) => acc + file.size, 0);

    const userTier = request.user.tier;
    const expiresInMs = expiresInDays * 24 * 60 * 60 * 1000;

    validateFileConstraints({
      userTier,
      totalFileSize,
      expiresInMs,
      usedStorage: request.user.usedStorage,
    });

    const expiresAt = new Date(Date.now() + expiresInMs);

    const [p2, _p3] = await Promise.all([
      createFiles({
        userId: request.user.id,
        expiresAt,
        // @ts-ignore
        files,
        sharedToUserIds: [],
      }),

      updateUserById(
        { id: request.user.id },
        {
          usedStorage: request.user.usedStorage + totalFileSize,
        },
      ),
    ]);


    const { link } = await createLink({
      title,
      message,
      fileIds: p2.files.map((file) => file.id),
      userId: request.user.id,
    });

    const augmentedFiles = link.files.map((file) => ({
      ...file,
      url: `https://${env.WASABI_BUCKET}.s3.${env.WASABI_REGION}.wasabisys.com/${file.name}`,
    }));

    link.files = augmentedFiles;



    return response.created(
      {
        data: { link },
      },
      { message: "Link Created Successfully!" },
    );
  } catch (error) {
    return handleErrors({ response, error });
  }
}

async function sendFileMail(request: Request, response: Response) {
  try {
    request.body.to = request.body.to
      .split(",")
      .map((email: string) => email.trim());

    const { to, title, message, expiresInDays, files } =
      sendFileMailBodySchema.parse(request.body);



    const rawFiles = [];

    const totalFileSize = rawFiles.reduce((acc, file) => acc + file.size, 0);

    const userTier = request.user.tier;
    const expiresInMs = expiresInDays * 24 * 60 * 60 * 1000;

    validateFileConstraints({
      userTier,
      totalFileSize,
      expiresInMs,
      usedStorage: request.user.usedStorage,
    });

    const expiresAt = new Date(Date.now() + expiresInMs);

    const users = await Promise.all(
      to.map((email) =>
        upsertUserByEmail(
          { email },
          {
            totalStorage: TierConstraints.FREE.maxStorage,
            usedStorage: 0,
          },
          {},
        ),
      ),
    );

    const [p2, _p3] = await Promise.all([
      createFiles({
        userId: request.user.id,
        expiresAt,
        // @ts-ignore
        files: files,
        sharedToUserIds: users.map(({ user }) => user.id),
      }),

      updateUserById(
        { id: request.user.id },
        {
          usedStorage: request.user.usedStorage + totalFileSize,
        },
      ),
    ]);

    const { mail } = await createMail({
      to,
      title,
      message,
      fileIds: p2.files.map((file) => file.id),
      userId: request.user.id,
    });

    const augmentedFiles = mail.files.map((file) => ({
      ...file,
      url: `https://${env.WASABI_BUCKET}.s3.${env.WASABI_REGION}.wasabisys.com/${file.name}`,
    }));

    sendFiles({
      senderEmail: request.user.email,
      recipientEmail: mail.to.join(", "),
      title: mail.title || "File Shared",
      message: mail.message,
      link: `${env.CLIENT_BASE_URL}/preview/${mail.id}`,
    });

    mail.files = augmentedFiles;

    return response.created(
      {
        data: { mail },
      },
      { message: "Mail Sent Successfully!" },
    );
  } catch (error) {
    return handleErrors({ response, error });
  }
}

async function getUserSharedFiles(request: Request, response: Response) {
  try {
    const { files } = await getFilesByUserId({ userId: request.user?.id });

    const augmentedFiles = files.map((file) => ({
      ...file,
      url: `https://${env.WASABI_BUCKET}.s3.${env.WASABI_REGION}.wasabisys.com/${file.name}`,
    }));

    return response.success(
      {
        data: { files: augmentedFiles },
      },
      { message: "Files Fetched Successfully!" },
    );
  } catch (error) {
    return handleErrors({ response, error });
  }
}

async function getUserReceivedFiles(request: Request, response: Response) {
  try {
    const { files } = await getSharedFilesByUserId({
      userId: request.user?.id,
    });

    const augmentedFiles = files.map((file) => ({
      ...file,
      url: `https://${env.WASABI_BUCKET}.s3.${env.WASABI_REGION}.wasabisys.com/${file.name}`,
    }));

    return response.success(
      {
        data: { files: augmentedFiles },
      },
      { message: "Files Fetched Successfully!" },
    );
  } catch (error) {
    return handleErrors({ response, error });
  }
}

async function getLink(request: Request, response: Response) {
  try {
    const { linkId } = getLinkParamsSchema.parse(request.params);

    const { link } = await getLinkById({ id: linkId });

    if (!link) {
      throw new BadResponse("Link Not Found!");
    }

    const augmentedFiles = link.files.map((file) => ({
      ...file,
      url: `https://${env.WASABI_BUCKET}.s3.${env.WASABI_REGION}.wasabisys.com/${file.name}`,
    }));

    link.files = augmentedFiles;


    return response.success(
      {
        data: { link },
      },
      { message: "Link Fetched Successfully!" },
    );
  } catch (error) {
    return handleErrors({ response, error });
  }
}

// async function downloadFile(request: Request, response: Response) {
//   try {
//     const { fileId } = updateFileParamsSchema.parse(request.params);

//     const { file } = await updateFileById(
//       { fileId },
//       {
//         downloads: {
//           increment: 1,
//         },
//       },
//     );

//     return response.success(
//       { file },
//       { message: "File Downloaded Successfully!" },
//     );
//   } catch (error) {
//     return handleErrors({ response, error });
//   }
// }

async function deleteFile(request: Request, response: Response) {
  try {
    const { fileId } = deleteFileParamsSchema.parse(request.params);

    const { file } = await updateFileById(
      { fileId, userId: request.user.id },
      { isDeleted: true },
    );

    if (!file) {
      throw new BadResponse("File Not Found!");
    }

    return response.success(
      { file },
      { message: "File Deleted Successfully!" },
    );
  } catch (error) {
    return handleErrors({ response, error });
  }
}

async function downloadFile(request: Request, response: Response) {
  try {
    const { fileId } = request.params;
    const ipAddress = request.ip; 
    const userAgent = request.headers["user-agent"]; 
    
    if (!fileId) {
      return response.status(400).json({ message: "File ID is required" });
    }

    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return response.status(404).json({ message: "File not found" });
    }

    const fingerprint = `${ipAddress}-${userAgent}`; 
    
    const alreadyDownloaded = file.downloadedBy.includes(fingerprint);

    if (!alreadyDownloaded) {
      const newDownloadedBy = [...file.downloadedBy, fingerprint];
      const newDownloadedAt = [...file.downloadedAt, new Date()];
      
      await prisma.file.update({
        where: { id: fileId },
        data: {
          downloadedBy: newDownloadedBy,
          downloadedAt: newDownloadedAt,
          downloads: { increment: 1 },
        },
      });
    }

    const params = {
      Bucket: process.env.WASABI_BUCKET,
      Key: file.name,
    };

    const signedUrl = await s3.getSignedUrlPromise('getObject', params);

    return response.status(200).json({ url: signedUrl });

  } catch (error) {
    console.error("Error downloading file:", error);
    return response.status(500).json({ message: "Server error" });
  }
}

export {
  // startMultipartUpload,
  // uploadChunk,
  // finalizeMultipartUpload,
  generateFileLink,
  sendFileMail,
  getUserSharedFiles,
  getUserReceivedFiles,
  getLink,
  downloadFile,
  deleteFile,
  completeMultiPart, presignedUrl, initiateUpload,
};
