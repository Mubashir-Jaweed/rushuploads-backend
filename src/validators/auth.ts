import { OtpType, Role } from "@prisma/client";
import * as zod from "zod";

const signUpSchema = zod.object({
  fullName: zod
    .string({
      message: "Invalid Full Name",
    })
    .min(3, {
      message: "Full Name must be at least 3 characters long",
    })
    .max(32, {
      message: "Full Name must be at most 32 characters long",
    })
    .optional(),
  email: zod
    .string({
      message: "Invalid Email",
    })
    .email({
      message: "Invalid Email",
    }),
  password: zod
    .string({
      message: "Invalid Password",
    })
    .min(8, {
      message: "Password must be at least 8 characters long",
    })
    .max(32, {
      message: "Password must be at most 32 characters long",
    })
    .optional(),
  role: zod
    .enum([Role.USER, Role.ADMIN], {
      message: "Role must be either 'USER' or 'ADMIN'",
    })
    .optional(),
});

const signInSchema = zod.object({
  email: zod
    .string({
      message: "Invalid Email",
    })
    .email({
      message: "Invalid Email",
    }),
  password: zod
    .string({
      message: "Invalid Password",
    })
    .min(8, {
      message: "Password must be at least 8 characters long",
    })
    .max(32, {
      message: "Password must be at most 32 characters long",
    })
    .optional(),
  role: zod
    .enum([Role.USER, Role.ADMIN], {
      message: "Role must be either 'USER' or 'ADMIN'",
    })
    .optional(),
});

const resetPasswordSchema = zod.object({
  email: zod
    .string({
      message: "Invalid Email",
    })
    .email({
      message: "Invalid Email",
    }),
  role: zod
    .enum([Role.USER, Role.ADMIN], {
      message: "Role must be either 'USER' or 'ADMIN'",
    })
    .optional(),
});

const verifyOtpSchema = zod.object({
  otp: zod
    .string({
      message: "Invalid OTP",
    })
    .length(6, {
      message: "OTP must be 6 characters long",
    }),
  type: zod
    .enum([OtpType.VERIFY_EMAIL, OtpType.RESET_PASSWORD], {
      message: "Invalid Type",
    })
    .default(OtpType.VERIFY_EMAIL),
});

const updatePasswordSchema = zod.object({
  password: zod
    .string({
      message: "Invalid Password",
    })
    .min(8, {
      message: "Password must be at least 8 characters long",
    })
    .max(32, {
      message: "Password must be at most 32 characters long",
    }),
});

export {
  signUpSchema,
  signInSchema,
  resetPasswordSchema,
  verifyOtpSchema,
  updatePasswordSchema,
};
