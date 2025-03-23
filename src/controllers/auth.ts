import type { Request, Response } from "express";

import { OtpType } from "@prisma/client";
import argon from "argon2";

import { TierConstraints } from "../constants/tiers";
import { BadResponse, NotFoundResponse, handleErrors } from "../lib/error";
import { sendOTP } from "../services/mail";
import { deleteOTPByUser, getOTPByUser, upsertOTP } from "../services/otp";
import { createProfile } from "../services/profile";
import {
  getUserByEmail,
  updateUserById,
  upsertUserByEmail,
} from "../services/user";
import { signToken } from "../utils/jwt";
import {
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
  verifyOtpSchema,
} from "../validators/auth";

async function signUp(request: Request, response: Response) {
  try {
    request.body.email = request.body.email.toLowerCase();

    const { fullName, email, password, role } = signUpSchema.parse(
      request.body,
    );

    if (fullName || password) {
      const { user: existingUser } = await getUserByEmail({ email, role });

      if (existingUser) {
        throw new BadResponse("User Already Exists!");
      }
    }

    let hashedPassword: string | undefined;

    if (password) {
      hashedPassword = await argon.hash(password);
    }

    const { user } = await upsertUserByEmail(
      {
        email,
        role,
      },
      {
        password: hashedPassword,
        totalStorage: TierConstraints.FREE.maxStorage,
        usedStorage: 0,
      },
      {
        password: hashedPassword,
      },
    );

    if (!user) {
      throw new NotFoundResponse("User Not Found!");
    }

    if (fullName) {
      await createProfile({ userId: user.id, fullName });
    }

    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      tier: user.tier,
      totalStorage: user.totalStorage,
      usedStorage: user.usedStorage,
      isVerified: user.isVerified,
      updatedAt: user.updatedAt,
    });

    const { otp } = await upsertOTP(
      { userId: user.id },
      { otpType: OtpType.VERIFY_EMAIL },
    );

    await sendOTP({
      to: user.email,
      code: otp.code,
    });

    return response.created(
      {
        data: { token },
      },
      {
        message: "Sign Up Successfull!",
      },
    );
  } catch (error) {
    return handleErrors({ response, error });
  }
}

async function signIn(request: Request, response: Response) {
  try {
    request.body.email = request.body.email.toLowerCase();

    const { email, password, role } = signInSchema.parse(request.body);

    const { user } = await getUserByEmail({ email, role });

    if (!user) {
      throw new NotFoundResponse("User Not Found!");
    }

    user.isVerified = user.password ? user.isVerified : false;

    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      tier: user.tier,
      totalStorage: user.totalStorage,
      usedStorage: user.usedStorage,
      isVerified: user.isVerified,
      updatedAt: user.updatedAt,
    });

    if (!user.password) {
      if (password) {
        throw new BadResponse("Invalid Password!");
      }

      const { otp } = await upsertOTP(
        { userId: user.id },
        { otpType: OtpType.VERIFY_EMAIL },
      );

      await sendOTP({
        to: user.email,
        code: otp.code,
      });

      user.password = undefined;

      return response.success(
        {
          data: { user, token },
        },
        {
          message: "OTP Sent Successfully!",
        },
      );
    }

    if (!password) {
      throw new BadResponse("Password Required!");
    }

    const isPasswordValid = await argon.verify(user.password, password);

    if (!isPasswordValid) {
      throw new BadResponse("Invalid Password!");
    }

    if (!user.isVerified) {
      const { otp } = await upsertOTP(
        { userId: user.id },
        { otpType: OtpType.VERIFY_EMAIL },
      );

      await sendOTP({
        to: user.email,
        code: otp.code,
      });

      return response.success(
        {
          data: { token },
        },
        {
          message: "OTP Sent Successfully!",
        },
      );
    }

    user.password = undefined;

    return response.success(
      {
        data: { user, token },
      },
      {
        message: "Sign In Successfull!",
      },
    );
  } catch (error) {
    return handleErrors({ response, error });
  }
}

async function resetPassword(request: Request, response: Response) {
  try {
    request.body.email = request.body.email.toLowerCase();

    const { email, role } = resetPasswordSchema.parse(request.body);

    const { user } = await getUserByEmail({ email, role });

    if (!user) {
      throw new NotFoundResponse("User Not Found!");
    }

    user.isVerified = false;

    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      tier: user.tier,
      totalStorage: user.totalStorage,
      usedStorage: user.usedStorage,
      isVerified: user.isVerified,
      updatedAt: user.updatedAt,
    });

    const { otp } = await upsertOTP(
      { userId: user.id },
      { otpType: OtpType.RESET_PASSWORD },
    );

    await sendOTP({
      to: user.email,
      code: otp.code,
    });

    return response.success(
      {
        data: { token },
      },
      {
        message: "OTP Sent Successfully!",
      },
    );
  } catch (error) {
    return handleErrors({ response, error });
  }
}

async function resendOtp(request: Request, response: Response) {
  try {
    const { otp } = await upsertOTP({ userId: request.user.id }, {});

    await sendOTP({
      to: request.user.email,
      code: otp.code,
    });

    return response.success(
      {},
      {
        message: "OTP Sent Successfully!",
      },
    );
  } catch (error) {
    return handleErrors({ response, error });
  }
}

async function verifyOtp(request: Request, response: Response) {
  try {
    const { otp, type } = verifyOtpSchema.parse(request.body);

    request.user.isVerified = true;

    const token = await signToken({
      id: request.user.id,
      email: request.user.email,
      role: request.user.role,
      tier: request.user.tier,
      totalStorage: request.user.totalStorage,
      usedStorage: request.user.usedStorage,
      isVerified: request.user.isVerified,
      updatedAt: request.user.updatedAt,
    });

    const { otp: existingOtp } = await getOTPByUser({
      userId: request.user.id,
      type,
    });

    if (!existingOtp) {
      throw new BadResponse("Invalid OTP!");
    }

    if (existingOtp.code !== otp) {
      throw new BadResponse("Invalid OTP!");
    }

    if (request.user.password && type === OtpType.VERIFY_EMAIL) {
      await updateUserById({ id: request.user.id }, { isVerified: true });
    }

    await deleteOTPByUser({ userId: request.user.id, type });

    request.user.password = undefined;

    return response.success(
      {
        data: { user: request.user, token },
      },
      {
        message: "OTP Verified Successfully!",
      },
    );
  } catch (error) {
    return handleErrors({ response, error });
  }
}

async function updatePassword(request: Request, response: Response) {
  try {
    const { password } = updatePasswordSchema.parse(request.body);

    const hashedPassword = await argon.hash(password);

    const { user } = await updateUserById(
      { id: request.user.id },
      { password: hashedPassword, isVerified: true },
    );

    user.password = undefined;

    return response.success(
      {
        data: { user },
      },
      {
        message: "Password Updated Successfully!",
      },
    );
  } catch (error) {
    return handleErrors({ response, error });
  }
}

async function refresh(request: Request, response: Response) {
  try {
    const token = await signToken({
      id: request.user.id,
      email: request.user.email,
      role: request.user.role,
      tier: request.user.tier,
      totalStorage: request.user.totalStorage,
      usedStorage: request.user.usedStorage,
      isVerified: true,
      updatedAt: request.user.updatedAt,
    });

    request.user.password = undefined;

    return response.success(
      {
        data: {
          user: request.user,
          token,
        },
      },
      {
        message: "Token Refreshed Successfully!",
      },
    );
  } catch (error) {
    return handleErrors({ response, error });
  }
}

export {
  signUp,
  signIn,
  resetPassword,
  resendOtp,
  verifyOtp,
  updatePassword,
  refresh,
};
