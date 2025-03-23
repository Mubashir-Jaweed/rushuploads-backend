import { Router } from "express";

import {
  createOneProfile,
  getOneProfile,
  updateOneProfile,
} from "../controllers/profile";
import { verifyRequest } from "../middlewares/auth";

const profileRouter = Router();

profileRouter.get("/", verifyRequest({ isVerified: true }), getOneProfile);

profileRouter.post("/", verifyRequest({ isVerified: true }), createOneProfile);

profileRouter.put("/", verifyRequest({ isVerified: true }), updateOneProfile);

export { profileRouter };
