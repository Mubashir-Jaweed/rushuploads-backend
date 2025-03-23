import { Tier } from "@prisma/client";
import * as zod from "zod";

const createCheckoutQuerySchema = zod.object({
  tier: zod.enum([Tier.PRO, Tier.PREMIUM], {
    message: "Tier must be either 'PRO' or 'PREMIUM'",
  }),
});

export { createCheckoutQuerySchema };
