import type { Role, Tier } from "@prisma/client";

import { TierConstraints } from "../constants/tiers";
import { prisma } from "../lib/prisma";

async function getUserById(query: { id: string; role?: Role }) {
  const user = await prisma.user.findUnique({
    where: {
      id: query.id,
      role: query.role,
      isDeleted: false,
    },
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
      tier: true,
      totalStorage: true,
      usedStorage: true,
      isVerified: true,
      updatedAt: true,
    },
  });

  return {
    user: user
      ? {
          ...user,
          transferLimit: TierConstraints[user.tier].maxSendSize,
        }
      : user,
  };
}

async function getUserByEmail(query: { email: string; role?: Role }) {
  const user = await prisma.user.findUnique({
    where: {
      email: query.email,
      role: query.role,
      isDeleted: false,
    },
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
      tier: true,
      totalStorage: true,
      usedStorage: true,
      isVerified: true,
      updatedAt: true,
    },
  });

  return {
    user: user
      ? {
          ...user,
          transferLimit: TierConstraints[user.tier].maxSendSize,
        }
      : user,
  };
}

async function getUsers(
  query: {
    text?: string;
    role?: Role;
    isVerified?: boolean;
    isDeleted?: boolean;
    skip?: number;
    take?: number;
  } = {},
) {
  const users = await prisma.user.findMany({
    where: {
      email: {
        contains: query.text,
      },
      role: query.role,
      isVerified: query.isVerified,
      isDeleted: query.isDeleted,
    },
    select: {
      id: true,
      email: true,
      role: true,
      tier: true,
      totalStorage: true,
      usedStorage: true,
      isVerified: true,
      updatedAt: true,
    },
    skip: query.skip,
    take: query.take,
  });

  return { users };
}

async function createUser(payload: {
  email: string;
  password: string;
  role?: Role;
  tier?: Tier;
  totalStorage: number;
  usedStorage: number;
  isVerified?: boolean;
  isDeleted?: boolean;
}) {
  const user = await prisma.user.create({
    data: {
      email: payload.email,
      password: payload.password,
      role: payload.role,
      totalStorage: TierConstraints.FREE.maxStorage,
      usedStorage: 0,
    },
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
      tier: true,
      totalStorage: true,
      usedStorage: true,
      isVerified: true,
      updatedAt: true,
    },
  });

  return {
    user: user
      ? {
          ...user,
          transferLimit: TierConstraints[user.tier].maxSendSize,
        }
      : user,
  };
}

async function updateUserById(
  query: { id: string; role?: Role },
  payload: {
    password?: string;
    role?: Role;
    tier?: Tier;
    totalStorage?: number;
    usedStorage?: number;
    isVerified?: boolean;
    isDeleted?: boolean;
  },
) {
  const user = await prisma.user.update({
    where: {
      id: query.id,
      role: query.role,
      isDeleted: false,
    },
    data: payload,
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
      tier: true,
      totalStorage: true,
      usedStorage: true,
      isVerified: true,
      updatedAt: true,
    },
  });

  return {
    user: user
      ? {
          ...user,
          transferLimit: TierConstraints[user.tier].maxSendSize,
        }
      : user,
  };
}

async function updateUserByEmail(
  query: { email: string; role?: Role },
  payload: {
    password?: string;
    role?: Role;
    tier?: Tier;
    totalStorage?: number;
    usedStorage?: number;
    isVerified?: boolean;
    isDeleted?: boolean;
  },
) {
  const user = await prisma.user.update({
    where: {
      email: query.email,
      role: query.role,
      isDeleted: false,
    },
    data: payload,
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
      tier: true,
      totalStorage: true,
      usedStorage: true,
      isVerified: true,
      updatedAt: true,
    },
  });

  return {
    user: user
      ? {
          ...user,
          transferLimit: TierConstraints[user.tier].maxSendSize,
        }
      : user,
  };
}

async function upsertUserByEmail(
  query: { email: string; role?: Role },
  create: {
    password?: string;
    role?: Role;
    tier?: Tier;
    totalStorage: number;
    usedStorage: number;
    isVerified?: boolean;
    isDeleted?: boolean;
  },
  update: {
    password?: string;
    role?: Role;
    tier?: Tier;
    totalStorage?: number;
    usedStorage?: number;
    isVerified?: boolean;
    isDeleted?: boolean;
  },
) {
  const user = await prisma.user.upsert({
    where: {
      email: query.email,
      role: query.role,
    },
    create: {
      email: query.email,
      password: create.password,
      role: create.role,
      tier: create.tier,
      totalStorage: create.totalStorage,
      usedStorage: create.usedStorage,
      isVerified: create.isVerified,
      isDeleted: create.isDeleted,
    },
    update: {
      email: query.email,
      password: update.password,
      role: update.role,
      tier: update.tier,
      totalStorage: update.totalStorage,
      usedStorage: update.usedStorage,
      isVerified: update.isVerified,
      isDeleted: update.isDeleted,
    },
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
      tier: true,
      totalStorage: true,
      usedStorage: true,
      isVerified: true,
      updatedAt: true,
    },
  });

  return {
    user: user
      ? {
          ...user,
          transferLimit: TierConstraints[user.tier].maxSendSize,
        }
      : user,
  };
}

async function deleteUserById(query: { id: string; role?: Role }) {
  const { user } = await updateUserById(query, {
    isDeleted: true,
  });

  return {
    user: user
      ? {
          ...user,
          transferLimit: TierConstraints[user.tier].maxSendSize,
        }
      : user,
  };
}

async function deleteUserByEmail(query: { email: string; role?: Role }) {
  const { user } = await updateUserByEmail(query, {
    isDeleted: true,
  });

  return {
    user: user
      ? {
          ...user,
          transferLimit: TierConstraints[user.tier].maxSendSize,
        }
      : user,
  };
}

export {
  getUserById,
  getUserByEmail,
  getUsers,
  createUser,
  updateUserById,
  updateUserByEmail,
  upsertUserByEmail,
  deleteUserById,
  deleteUserByEmail,
};
