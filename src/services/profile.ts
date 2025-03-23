import type { Prisma, Role } from "@prisma/client";

import { prisma } from "../lib/prisma";

async function getProfileByUserId(query: { userId: string }) {
  const profile = await prisma.profile.findUnique({
    where: {
      userId: query.userId,
    },
    select: {
      id: true,
      fullName: true,
      updatedAt: true,
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  return { profile };
}

async function createProfile(payload: {
  userId: string;
  fullName: string;
}) {
  const profile = await prisma.profile.create({
    data: {
      fullName: payload.fullName,
      user: {
        connect: {
          id: payload.userId,
        },
      },
    },
    select: {
      id: true,
      fullName: true,
      updatedAt: true,
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  return { profile };
}

async function updateProfile(
  query: {
    userId: string;
  },
  payload: Prisma.ProfileUpdateInput,
) {
  const profile = await prisma.profile.update({
    where: {
      userId: query.userId,
    },
    data: payload,
    select: {
      id: true,
      fullName: true,
      updatedAt: true,
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  return { profile };
}

async function upsertProfile(
  query: {
    userId: string;
  },
  payload: Prisma.ProfileCreateInput,
) {
  const profile = await prisma.profile.upsert({
    where: {
      userId: query.userId,
    },
    update: payload,
    create: payload,
    select: {
      id: true,
      fullName: true,
      updatedAt: true,
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  return { profile };
}

export { getProfileByUserId, createProfile, updateProfile, upsertProfile };
