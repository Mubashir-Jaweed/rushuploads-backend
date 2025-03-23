import * as zod from "zod";

const createOneProfileBodySchema = zod.object({
  fullName: zod
    .string({
      message: "Invalid Full Name",
    })
    .min(3, {
      message: "Full Name must be at least 3 characters long",
    })
    .max(32, {
      message: "Full Name must be at most 32 characters long",
    }),
});

const updateOneProfileBodySchema = zod.object({
  fullName: zod
    .string({
      message: "Invalid Full Name",
    })
    .min(3, {
      message: "Full Name must be at least 3 characters long",
    })
    .max(32, {
      message: "Full Name must be at most 32 characters long",
    }),
});

export { createOneProfileBodySchema, updateOneProfileBodySchema };
