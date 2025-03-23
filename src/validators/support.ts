import * as zod from "zod";

const sendSupportEmailBodySchema = zod.object({
  email: zod
    .string({
      message: "Email is Required!",
    })
    .email({
      message: "Invalid Email!",
    }),
  subject: zod.string({
    message: "Subject is Required!",
  }),
  message: zod.string({
    message: "Message is Required!",
  }),
});

export { sendSupportEmailBodySchema };
