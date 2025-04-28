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
        downloadedAt: true,
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


interface MonetizationSettings {
  value: 'ON' | 'OFF';
  redirectUrl: string;
  bannerUrl: string;
}

const defaultMonetizationSettings: MonetizationSettings = {
  value: 'OFF',
  redirectUrl: '',
  bannerUrl: ''
};

async function getMonetizationSettings(_req: Request, res: Response) {
  try {
    const settings = await prisma.setting.findUnique({
      where: { key: 'monetization' }
    });

    const resultSettings = settings?.value 
      ? (settings.value as MonetizationSettings)
      : defaultMonetizationSettings;

    return res.status(200).json({
      data: resultSettings,
      message: "Monetization settings retrieved successfully"
    });
  } catch (error) {
    return handleErrors({ response: res, error });
  }
}
async function updateMonetizationSettings(req: Request, res: Response) {
  try {
    const { value, redirectUrl, bannerUrl } = req.body as Partial<MonetizationSettings>;

    // Determine base values (existing or defaults)
    const existingSetting = await prisma.setting.findUnique({
      where: { key: 'monetization' },
    });

    // Merge values based on existence
    const baseValues = existingSetting?.value as MonetizationSettings || {
      value: 'OFF', // Default state
      redirectUrl: '',
      bannerUrl: ''
    };

    const updatedValue: MonetizationSettings = {
      value: value ?? baseValues.value,
      redirectUrl: redirectUrl ?? baseValues.redirectUrl,
      bannerUrl: bannerUrl ?? baseValues.bannerUrl,
    };

    // Validate
    if (!['ON', 'OFF'].includes(updatedValue.value)) {
      return res.status(400).json({ error: "Invalid monetization value" });
    }

    // Upsert (create or update) the setting
    await prisma.setting.upsert({
      where: { key: 'monetization' },
      update: { value: updatedValue },
      create: {
        key: 'monetization',
        value: updatedValue,
      },
    });

    return res.status(200).json({
      message: "Monetization settings updated successfully",
    });
  } catch (error) {
    return handleErrors({ response: res, error });
  }
}


async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated through this endpoint
    const { password, refreshToken, ...safeUpdateData } = updateData;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: safeUpdateData,
    });

    // Omit sensitive fields from response
    const { password: _, refreshToken: __, ...safeUser } = updatedUser;

    res.status(200).json(safeUser);
  } catch (error) {
    console.error('Error updating user:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Record to update not found')) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (error.message.includes('Invalid value')) {
        return res.status(400).json({ message: 'Invalid data provided' });
      }
    }

    res.status(500).json({ message: 'Failed to update user' });
  }
}


async function updateFile(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { originalName } = req.body;

    // Validate the filename
    if (!originalName?.trim()) {
      return res.status(400).json({ message: 'File name is required' });
    }

    // Update only the originalName field
    const updatedFile = await prisma.file.update({
      where: { id },
      data: { 
        originalName: originalName.trim() 
      },
      select: {
        id: true,
        originalName: true,
        updatedAt: true
      }
    });

    res.status(200).json(updatedFile);
  } catch (error) {
    console.error('Error updating file:', error);
    
    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'File not found' });
      }
    }

    res.status(500).json({ message: 'Failed to update file name' });
  }
}


export {
  getKPIs,
  getAllUsers,
  getAllFiles,
  deleteUser,
  deleteFile,
  claimRewards,
  getMonetizationSettings,
  updateMonetizationSettings,
  updateUser,
  updateFile
};
