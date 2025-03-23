import type { OtpType } from "@prisma/client";

import { prisma } from "../lib/prisma";

async function upsertOTP(
  query: { userId: string },
  payload: { otpType?: OtpType },
) {
  const sampleSpace = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  let code = "";

  for (let i = 0; i < 6; i++) {
    code += sampleSpace[Math.floor(Math.random() * sampleSpace.length)];
  }

  const otp = await prisma.otp.upsert({
    where: {
      userId: query.userId,
    },
    create: {
      userId: query.userId,
      code,
      type: payload.otpType,
    },
    update: {
      code,
      type: payload.otpType,
    },
    select: {
      id: true,
      code: true,
      type: true,
      updatedAt: true,
    },
  });

  return { otp };
}

async function getOTPByUser(query: { userId: string; type?: OtpType }) {
  const otp = await prisma.otp.findUnique({
    where: {
      userId: query.userId,
      type: query.type,
    },
    select: {
      id: true,
      code: true,
      type: true,
      updatedAt: true,
    },
  });

  return { otp };
}

async function deleteOTPByUser(query: { userId: string; type?: OtpType }) {
  const otp = await prisma.otp.delete({
    where: {
      userId: query.userId,
      type: query.type,
    },
    select: {
      id: true,
      code: true,
      type: true,
      updatedAt: true,
    },
  });

  return { otp };
}

export { upsertOTP, getOTPByUser, deleteOTPByUser };
