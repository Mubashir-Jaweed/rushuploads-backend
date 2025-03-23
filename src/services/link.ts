import { prisma } from "../lib/prisma";

async function createLink(payload: {
  title?: string;
  message?: string;
  fileIds: string[];
  userId: string;
}) {
  const link = await prisma.link.create({
    data: {
      title: payload.title,
      message: payload.message,
      files: {
        connect: payload.fileIds.map((id) => ({ id })),
      },
      user: {
        connect: {
          id: payload.userId,
        },
      },
    },
    select: {
      id: true,
      title: true,
      message: true,
      updatedAt: true,
      files: {
        select: {
          id: true,
          originalName: true,
          name: true,
          type: true,
          size: true,
          isExpired: true,
          expiredAt: true,
          updatedAt: true,
        },
      },
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  return { link };
}

async function getLinkById(query: { id: string }) {
  const link = await prisma.link.findUnique({
    where: { id: query.id },
    select: {
      id: true,
      title: true,
      message: true,
      updatedAt: true,
      files: {
        select: {
          id: true,
          originalName: true,
          name: true,
          type: true,
          size: true,
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

  return { link };
}

export { createLink, getLinkById };
