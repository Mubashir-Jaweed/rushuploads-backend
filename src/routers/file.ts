import { Router } from "express";

import {
  deleteFile,
  downloadFile,
  finalizeMultipartUpload,
  generateFileLink,
  getLink,
  getUserReceivedFiles,
  getUserSharedFiles,
  sendFileMail,
  startMultipartUpload,
  uploadChunk,
} from "../controllers/file";
import { verifyRequest } from "../middlewares/auth";
import { upload } from "../middlewares/upload";

const fileRouter = Router();

fileRouter.post(
  "/start",
  verifyRequest({ isVerified: true }),
  startMultipartUpload,
);

fileRouter.post(
  "/upload",
  verifyRequest({ isVerified: true }),
  upload,
  uploadChunk,
);

fileRouter.post(
  "/finalize",
  verifyRequest({ isVerified: true }),
  finalizeMultipartUpload,
);

fileRouter.get(
  "/shared",
  verifyRequest({ isVerified: true }),
  getUserSharedFiles,
);

fileRouter.get(
  "/received",
  verifyRequest({ isVerified: true }),
  getUserReceivedFiles,
);

fileRouter.get("/link/:linkId", getLink);

fileRouter.post("/link", verifyRequest({ isVerified: true }), generateFileLink);

fileRouter.post("/mail", verifyRequest({ isVerified: true }), sendFileMail);

fileRouter.post("/download/:fileId", downloadFile);

fileRouter.delete("/:fileId", verifyRequest({ isVerified: true }), deleteFile);

export { fileRouter };
