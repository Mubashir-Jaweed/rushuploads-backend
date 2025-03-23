import { Router } from "express";

import {
  deleteOneUser,
  getAllUsers,
  getOneUser,
  updateOneUser,
} from "../controllers/user";
import { verifyRequest } from "../middlewares/auth";

const userRouter = Router();

userRouter.get(
  "/all",
  verifyRequest({ isVerified: true, role: "ADMIN" }),
  getAllUsers,
);

userRouter.get(
  "/one",
  verifyRequest({ isVerified: true, role: "ADMIN" }),
  getOneUser,
);

userRouter.patch(
  "/one",
  verifyRequest({ isVerified: true, role: "ADMIN" }),
  updateOneUser,
);

userRouter.delete(
  "/one",
  verifyRequest({ isVerified: true, role: "ADMIN" }),
  deleteOneUser,
);

export { userRouter };
