import type { Request, Response } from "express";

import { BadResponse, NotFoundResponse, handleErrors } from "../lib/error";
import { getProfileByUserId, upsertProfile } from "../services/profile";
import { createOneProfileBodySchema } from "../validators/profile";

async function getOneProfile(request: Request, response: Response) {
  try {
    const { profile } = await getProfileByUserId({ userId: request.user.id });

    if (!profile) {
      throw new NotFoundResponse("Profile Not Found!");
    }

    return response.success(
      {
        data: { profile },
      },
      {
        message: "Profile Retrieved Successfully!",
      },
    );
  } catch (error) {
    return handleErrors({ error, response });
  }
}

async function createOneProfile(request: Request, response: Response) {
  try {
    const { fullName } = createOneProfileBodySchema.parse(request.body);

    const { profile } = await upsertProfile(
      {
        userId: request.user.id,
      },
      {
        fullName,
        user: {
          connect: {
            id: request.user.id,
          },
        },
      },
    );

    if (!profile) {
      throw new BadResponse("Profile Creation Failed!");
    }

    return response.success(
      {
        data: { profile },
      },
      {
        message: "Profile Created Successfully!",
      },
    );
  } catch (error) {
    return handleErrors({ error, response });
  }
}

async function updateOneProfile(request: Request, response: Response) {
  try {
    const { fullName } = createOneProfileBodySchema.parse(request.body);

    const { profile } = await upsertProfile(
      {
        userId: request.user.id,
      },
      {
        fullName,
        user: {
          connect: {
            id: request.user.id,
          },
        },
      },
    );

    if (!profile) {
      throw new BadResponse("Profile Update Failed!");
    }

    return response.success(
      {
        data: { profile },
      },
      {
        message: "Profile Updated Successfully!",
      },
    );
  } catch (error) {
    return handleErrors({ error, response });
  }
}

export { getOneProfile, createOneProfile, updateOneProfile };
