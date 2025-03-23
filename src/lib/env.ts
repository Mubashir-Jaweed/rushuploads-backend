import "dotenv/config";

import * as zod from "zod";

const envSchema = zod.object({
  NODE_ENV: zod.enum(["development", "production"]),
  PORT: zod.coerce.number().min(1000).max(9999),
  SSL_KEY_PATH: zod.string().optional(),
  SSL_CERT_PATH: zod.string().optional(),
  SSL_CA_PATH: zod.string().optional(),
  JWT_SECRET: zod.string(),
  JWT_EXPIRY: zod.string(),
  NODEMAILER_HOST: zod.string(),
  NODEMAILER_PORT: zod.coerce.number(),
  NODEMAILER_SECURE: zod.coerce.boolean(),
  NODEMAILER_EMAIL: zod.string().email(),
  NODEMAILER_PASSWORD: zod.string(),
  DATABASE_URL: zod.string().url(),
  CLIENT_BASE_URL: zod.string().url(),
  APP_NAME: zod.string(),
  APP_SUPPORT_EMAIL: zod.string().email(),
  APP_ADMIN_EMAIL: zod.string().email(),
  AWS_ACCESS_KEY_ID: zod.string(),
  AWS_SECRET_ACCESS_KEY: zod.string(),
  AWS_BUCKET: zod.string(),
  AWS_REGION: zod.string(),
  STRIPE_SECRET_KEY: zod.string(),
  STRIPE_WEBHOOK_SECRET_KEY: zod.string(),
  STRIPE_PRO_PRICE_ID: zod.string(),
  STRIPE_PREMIUM_PRICE_ID: zod.string(),
  STRIPE_SUCCESS_ENDPOINT: zod.string(),
  STRIPE_CANCEL_ENDPOINT: zod.string(),
  STRIPE_RETURN_ENDPOINT: zod.string(),
});

export const env = envSchema.parse(process.env);
