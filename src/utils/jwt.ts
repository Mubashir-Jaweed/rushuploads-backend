import type { Role, Tier } from "@prisma/client";

import jwt from "jsonwebtoken";

import { env } from "../lib/env";

async function signToken(payload: {
  id: string;
  email: string;
  role: Role;
  tier: Tier;
  totalStorage: number;
  usedStorage: number;
  isVerified: boolean;
  updatedAt: Date;
}) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRY,
  });
}

async function verifyToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET);
}

export { signToken, verifyToken };
