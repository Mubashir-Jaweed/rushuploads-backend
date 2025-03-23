import type { Request, Response } from "express";

import { BadResponse, handleErrors } from "../lib/error";
import {
  deleteUserById,
  getUserById,
  getUsers,
  updateUserById,
} from "../services/user";
import {
  deleteOneUserParamsSchema,
  getAllUsersQuerySchema,
  getOneUserParamsSchema,
  updateOneUserBodySchema,
} from "../validators/user";

async function getAllUsers(request: Request, response: Response) {
  try {
    const {
      text,
      role,
      isVerified,
      isDeleted,
      page = 1,
      limit = 10,
    } = getAllUsersQuerySchema.parse(request.query);

    const skip = (page - 1) * limit;
    const take = limit;

    const users = await getUsers({
      text,
      role,
      isVerified,
      isDeleted,
      skip,
      take,
    });

    response.success(
      {
        data: { users },
      },
      { message: "Users Fetched Successfully!" },
    );
  } catch (error) {
    handleErrors({ response, error });

    return;
  }
}

async function getOneUser(request: Request, response: Response) {
  try {
    const { userId } = getOneUserParamsSchema.parse(request.params);

    const user = await getUserById({ id: userId });

    if (!user) {
      throw new BadResponse("User Not Found!");
    }

    response.success(
      {
        data: { user },
      },
      { message: "User Fetched Successfully!" },
    );
  } catch (error) {
    handleErrors({ response, error });

    return;
  }
}

async function updateOneUser(request: Request, response: Response) {
  try {
    const { userId } = getOneUserParamsSchema.parse(request.params);
    const { role, isVerified, isDeleted } = updateOneUserBodySchema.parse(
      request.body,
    );

    const user = await getUserById({ id: userId });

    if (!user) {
      throw new BadResponse("User Not Found!");
    }

    const { user: updatedUser } = await updateUserById(
      { id: userId },
      { role, isVerified, isDeleted },
    );

    response.success(
      {
        data: { user: updatedUser },
      },
      { message: "User Updated Successfully!" },
    );
  } catch (error) {
    handleErrors({ response, error });

    return;
  }
}

async function deleteOneUser(request: Request, response: Response) {
  try {
    const { userId } = deleteOneUserParamsSchema.parse(request.params);

    const user = await getUserById({ id: userId });

    if (!user) {
      throw new BadResponse("User Not Found!");
    }

    const { user: deletedUser } = await deleteUserById({ id: userId });

    response.success(
      {
        data: { user: deletedUser },
      },
      { message: "User Deleted Successfully!" },
    );
  } catch (error) {
    handleErrors({ response, error });

    return;
  }
}

export { getAllUsers, getOneUser, updateOneUser, deleteOneUser };
