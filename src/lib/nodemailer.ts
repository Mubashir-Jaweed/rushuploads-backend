import nodemailer from "nodemailer";

import { env } from "./env";

const nodemailerTransporter = nodemailer.createTransport({
  host: env.NODEMAILER_HOST,
  port: env.NODEMAILER_PORT,
  secure: env.NODEMAILER_SECURE,
  auth: {
    user: env.NODEMAILER_EMAIL,
    pass: env.NODEMAILER_PASSWORD,
  },
});

export { nodemailerTransporter };
