import type { Response } from "express";

import { ZodError } from "zod";

class ErrorResponse extends Error {
  public status: number;

  public constructor(status: number, message: string) {
    super(message);

    this.status = status;
  }
}

class BadResponse extends ErrorResponse {
  public constructor(message: string) {
    super(400, message);
  }
}

class UnauthorizedResponse extends ErrorResponse {
  public constructor(message: string) {
    super(401, message);
  }
}

class ForbiddenResponse extends ErrorResponse {
  public constructor(message: string) {
    super(403, message);
  }
}

class NotFoundResponse extends ErrorResponse {
  public constructor(message: string) {
    super(404, message);
  }
}

function handleErrors({
  response,
  error,
}: { response: Response; error: unknown }) {
  if (error instanceof ZodError) {
    response.badRequest(
      {},
      {
        message: error.errors[0].message,
      },
    );

    return;
  }

  if (error instanceof ErrorResponse) {
    switch (error.status) {
      case 400:
        response.badRequest(
          {},
          {
            message: error.message,
          },
        );

        return;

      case 401:
        response.unauthorized(
          {},
          {
            message: error.message,
          },
        );

        return;

      case 403:
        response.forbidden(
          {},
          {
            message: error.message,
          },
        );

        return;

      case 404:
        response.notFound(
          {},
          {
            message: error.message,
          },
        );

        return;
    }
  }

  console.error(error);

  if (error instanceof Error) {
    response.internalServerError(
      {},
      {
        message: error.message,
      },
    );

    return;
  }

  response.internalServerError(
    {},
    {
      message: "Something went wrong!",
    },
  );

  return;
}

export {
  ErrorResponse,
  BadResponse,
  UnauthorizedResponse,
  ForbiddenResponse,
  NotFoundResponse,
  handleErrors,
};
