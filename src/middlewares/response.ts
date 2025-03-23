import type { NextFunction, Request, Response } from "express";

import type { Info, JSONObject } from "../../types";

async function expandResponse(
  _request: Request,
  response: Response,
  next: NextFunction,
) {
  response.success = (
    body: JSONObject,
    info: Info = { message: "Success!" },
  ) => {
    body.info = info as unknown as JSONObject;

    response.status(200).json(body);
  };

  response.created = (
    body: JSONObject,
    info: Info = { message: "Created!" },
  ) => {
    body.info = info as unknown as JSONObject;

    response.status(201).json(body);
  };

  response.badRequest = (
    body: JSONObject,
    info: Info = { message: "Bad Request!" },
  ) => {
    body.info = info as unknown as JSONObject;

    response.status(400).json(body);
  };

  response.unauthorized = (
    body: JSONObject,
    info: Info = { message: "Unauthorized!" },
  ) => {
    body.info = info as unknown as JSONObject;

    response.status(401).json(body);
  };

  response.forbidden = (
    body: JSONObject,
    info: Info = { message: "Forbidden!" },
  ) => {
    body.info = info as unknown as JSONObject;

    response.status(403).json(body);
  };

  response.notFound = (
    body: JSONObject,
    info: Info = { message: "Not Found!" },
  ) => {
    body.info = info as unknown as JSONObject;

    response.status(404).json(body);
  };

  response.internalServerError = (
    body: JSONObject,
    info: Info = { message: "Internal Server Error!" },
  ) => {
    body.info = info as unknown as JSONObject;

    response.status(500).json(body);
  };

  next();
}

export { expandResponse };
