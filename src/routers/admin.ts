import { Router } from "express";

import {
  claimRewards,
  deleteFile,
  deleteUser,
  getAllFiles,
  getAllUsers,
  getKPIs,
  getMonetizationSettings,
  updateMonetizationSettings,
} from "../controllers/admin";
import { verifyRequest } from "../middlewares/auth";

const adminRouter = Router();

adminRouter.get(
  "/kpis",
  verifyRequest({
    isVerified: true,
    role: "ADMIN",
  }),
  getKPIs,
);

adminRouter.get(
  "/users",
  verifyRequest({
    isVerified: true,
    role: "ADMIN",
  }),
  getAllUsers,
);

adminRouter.get(
  "/files",
  verifyRequest({
    isVerified: true,
    role: "ADMIN",
  }),
  getAllFiles,
);

adminRouter.put(
  "/rewards/claim/:id",
  verifyRequest({
    isVerified: true,
    role: "ADMIN",
  }),
  claimRewards,
);

adminRouter.delete(
  "/users/:id",
  verifyRequest({
    isVerified: true,
    role: "ADMIN",
  }),
  deleteUser,
);

adminRouter.delete(
  "/files/:id",
  verifyRequest({
    isVerified: true,
    role: "ADMIN",
  }),
  deleteFile,
);

adminRouter.get(
  "/settings",
  verifyRequest({
    isVerified: true,
    role:"ADMIN",
  }),
  getMonetizationSettings
)
adminRouter.put(
  "/settings/monetization",
  verifyRequest({
    isVerified: true,
    role:"ADMIN",
  }),
  updateMonetizationSettings
)

export { adminRouter };
