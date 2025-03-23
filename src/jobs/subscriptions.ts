import { SubscriptionStatus, Tier } from "@prisma/client";

import { TierConstraints } from "../constants/tiers";
import { prisma } from "../lib/prisma";

async function downgradeNonActiveSubscriptions() {
  const now = new Date();

  const canceledSubscriptions = await prisma.subscription.findMany({
    where: {
      status: {
        not: SubscriptionStatus.ACTIVE,
      },
      currentPeriodEnd: {
        lte: now,
      },
    },
  });

  for (const subscription of canceledSubscriptions) {
    await prisma.user.update({
      where: {
        id: subscription.userId,
      },
      data: {
        tier: Tier.FREE,
        totalStorage: TierConstraints[Tier.FREE].maxStorage,
      },
    });
  }
}

async function deleteFilesOfNonActiveSubscriptions() {
  const now = new Date();
  now.setDate(now.getDate() + 7);

  const nonActiveSubscriptions = await prisma.subscription.findMany({
    where: {
      status: {
        not: SubscriptionStatus.ACTIVE,
      },
      currentPeriodEnd: {
        lte: now,
      },
    },
  });

  for (const subscription of nonActiveSubscriptions) {
    await prisma.file.updateMany({
      where: {
        userId: subscription.userId,
        isDeleted: false,
      },
      data: {
        isDeleted: true,
      },
    });
  }
}

export { downgradeNonActiveSubscriptions, deleteFilesOfNonActiveSubscriptions };
