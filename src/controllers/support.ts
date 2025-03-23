import type { Request, Response } from "express";

import { env } from "../lib/env";
import { handleErrors } from "../lib/error";
import { nodemailerTransporter } from "../lib/nodemailer";
import { sendSupportEmailBodySchema } from "../validators/support";

export async function sendSupportEmail(request: Request, response: Response) {
  try {
    const { subject, message } = sendSupportEmailBodySchema.parse(request.body);

    const rawFiles = (request.files as Express.Multer.File[]) ?? [];

    nodemailerTransporter.sendMail({
      from: env.APP_SUPPORT_EMAIL,
      to: env.APP_ADMIN_EMAIL,
      subject,
      text: message,
      attachments: rawFiles.map((file) => ({
        filename: file.originalname,
        content: file.buffer,
      })),
    });

    return response.success({}, { message: "Email Sent Successfully!" });
  } catch (error) {
    return handleErrors({ response, error });
  }
}
