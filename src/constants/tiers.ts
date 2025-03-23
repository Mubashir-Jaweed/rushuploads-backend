import { Tier } from "@prisma/client";

import { env } from "../lib/env";

const TierConstraints = {
  // FREE: {
  //   maxSendSize: 2.5 * 1024 * 1024 * 1024, // 2.5 GB in bytes
  //   maxStorage: 25 * 1024 * 1024 * 1024, // 25 GB in bytes
  //   minExpiry: 3 * 24 * 60 * 60 * 1000, // 3 days in milliseconds
  //   maxExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  // },
  FREE: {
    maxSendSize: -1, // No limit
    maxStorage: -1, // No limit
    minExpiry: 3 * 24 * 60 * 60 * 1000, // 3 days in milliseconds
    maxExpiry: 365 * 24 * 60 * 60 * 1000, // 365 days in milliseconds
  },
  PRO: {
    maxSendSize: 250 * 1024 * 1024 * 1024, // 250 GB in bytes
    maxStorage: 1 * 1024 * 1024 * 1024 * 1024, // 1 TB in bytes
    minExpiry: 3 * 24 * 60 * 60 * 1000, // 3 days in milliseconds
    maxExpiry: 90 * 24 * 60 * 60 * 1000, // 90 days in milliseconds
  },
  PREMIUM: {
    maxSendSize: -1, // No limit
    maxStorage: -1, // No limit
    minExpiry: 3 * 24 * 60 * 60 * 1000, // 3 days in milliseconds
    maxExpiry: 365 * 24 * 60 * 60 * 1000, // 365 days in milliseconds
  },
};

const PriceIdToTierMap = {
  [env.STRIPE_PRO_PRICE_ID]: Tier.PRO,
  [env.STRIPE_PREMIUM_PRICE_ID]: Tier.PREMIUM,
};

const TierToPriceIdMap = {
  [Tier.PRO]: env.STRIPE_PRO_PRICE_ID,
  [Tier.PREMIUM]: env.STRIPE_PREMIUM_PRICE_ID,
};

export { TierConstraints, PriceIdToTierMap, TierToPriceIdMap };
