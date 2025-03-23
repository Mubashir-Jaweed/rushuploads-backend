import type { Request, Response } from "express";

import { handleErrors } from "../lib/error";
import { prisma } from "../lib/prisma";
import { getUsers } from "../services/user";
import { updateFileById } from "../services/file";

async function getKPIs(_request: Request, response: Response) {
  try {
    const [users, files, downloads, topDownloadedFiles] =
      await prisma.$transaction([
        prisma.user.count({ where: { isDeleted: false } }),
        prisma.file.count({ where: { isDeleted: false } }),
        prisma.file.aggregate({
          where: {
            downloads: {
              gt: 0,
            },
            isDeleted: false,
          },
          _sum: { downloads: true },
        }),
        prisma.file.findMany({
          where: {
            downloads: {
              gt: 0,
            },
            isDeleted: false,
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
          orderBy: { downloads: "desc" },
          take: 10,
        }),
      ]);

    return response.success(
      {
        data: {
          counts: {
            users,
            files,
            downloads: downloads._sum.downloads,
          },
          files: {
            topDownloads: topDownloadedFiles,
          },
        },
      },
      { message: "KPIs retrieved successfully" },
    );
  } catch (error) {
    return handleErrors({ response, error });
  }
}

async function getAllUsers(_request: Request, response: Response) {
  try {
    const { users } = await getUsers({ role: "USER" });

    return response.success(
      {
        data: {
          users,
        },
      },
      { message: "Users retrieved successfully" },
    );
  } catch (error) {
    return handleErrors({ response, error });
  }
}

async function getAllFiles(_request: Request, response: Response) {
  try {
    const files = await prisma.file.findMany({
      where: {
        isDeleted: false,
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

    return response.success(
      {
        data: {
          files,
        },
      },
      { message: "Files retrieved successfully" },
    );
  } catch (error) {
    return handleErrors({ response, error });
  }
}

async function deleteUser(request: Request, response: Response) {
  try {
    const { id } = request.params;

    await prisma.user.update({
      where: { id },
      data: { isDeleted: true },
    });

    return response.success({}, { message: "User deleted successfully" });
  } catch (error) {
    return handleErrors({ response, error });
  }
}

async function deleteFile(request: Request, response: Response) {
  try {
    const { id } = request.params;

    await prisma.file.update({
      where: { id },
      data: { isDeleted: true },
    });

    return response.success({}, { message: "File deleted successfully" });
  } catch (error) {
    return handleErrors({ response, error });
  }
}

async function claimRewards(request: Request, response: Response) {
  try {
    const { id } = request.params;

    const { claims } = request.body;

    const { file } = await updateFileById(
      { fileId: id },
      { claims: { decrement: -1 * claims } },
    );

    return response.success(
      {
        data: {
          file,
        },
      },
      { message: "Rewards claimed successfully" },
    );
  } catch (error) {
    return handleErrors({ response, error });
  }
}

export {
  getKPIs,
  getAllUsers,
  getAllFiles,
  deleteUser,
  deleteFile,
  claimRewards,
};
