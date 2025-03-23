import { Router } from "express";

import {
  refresh,
  resendOtp,
  resetPassword,
  signIn,
  signUp,
  updatePassword,
  verifyOtp,
} from "../controllers/auth";
import { verifyRequest } from "../middlewares/auth";

const authRouter = Router();

authRouter.post("/sign-up", signUp);

authRouter.post("/sign-in", signIn);

authRouter.post("/reset-password", resetPassword);

authRouter.post(
  "/resend-otp",
  verifyRequest({
    isVerified: false,
  }),
  resendOtp,
);

authRouter.post(
  "/verify-otp",
  verifyRequest({
    isVerified: false,
  }),
  verifyOtp,
);

authRouter.post(
  "/update-password",
  verifyRequest({
    isVerified: true,
  }),
  updatePassword,
);

authRouter.post(
  "/refresh",
  verifyRequest({
    isVerified: true,
  }),
  refresh,
);

export { authRouter };
