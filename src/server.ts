import type { Server } from "node:http";

import { readFileSync } from "node:fs";
import { createServer as createHttpServer } from "node:http";
import { createServer as createHttpsServer } from "node:https";

import cron from "node-cron";

import { app } from "./app";
import { cleanupFiles, markExpiredFiles } from "./jobs/file";
import {
  deleteFilesOfNonActiveSubscriptions,
  downgradeNonActiveSubscriptions,
} from "./jobs/subscriptions";
import { env } from "./lib/env";

let server: Server;

switch (env.NODE_ENV) {
  // case "production":
  //   if (!env.SSL_KEY_PATH || !env.SSL_CERT_PATH || !env.SSL_CA_PATH) {
  //     throw new Error(
  //       "SSL_KEY_PATH, SSL_CERT_PATH, and SSL_CA_PATH are required in production",
  //     );
  //   }

  //   server = createHttpsServer(
  //     {
  //       key: readFileSync(env.SSL_KEY_PATH),
  //       cert: readFileSync(env.SSL_CERT_PATH),
  //       ca: readFileSync(env.SSL_CA_PATH),
  //     },
  //     app,
  //   );
  //   break;
  default:
    server = createHttpServer(app);
    break;
}

server.timeout = 0;
server.keepAliveTimeout = 0;

server.listen({ port: env.PORT }, () => {
  console.log(
    `Server is live on ${env.NODE_ENV === "production" ? "https" : "http"}://localhost:${env.PORT}`,
  );
});

// cron.schedule("0 0 * * *", async () => {
//   console.log("Running cron job to mark expired files...");
//   await markExpiredFiles();
//   console.log("Cron job to cleanup files completed!");

//   console.log("Running cron job to cleanup files...");
//   await cleanupFiles();
//   console.log("Cron job to cleanup files completed!");
// });

// cron.schedule("0 0 * * *", async () => {
//   console.log("Running cron job to downgrade non active subscriptions...");
//   await downgradeNonActiveSubscriptions();
//   console.log("Cron job to downgrade non active subscriptions completed!");
// });

// cron.schedule("0 0 * * *", async () => {
//   console.log(
//     "Running cron job to delete files of non active subscriptions...",
//   );
//   await deleteFilesOfNonActiveSubscriptions();
//   console.log(
//     "Cron job to delete files of non active subscriptions completed!",
//   );
// });

export { server };
