import { Router } from "express";

import { sendSupportEmail } from "../controllers/support";

const supportRouter = Router();

supportRouter.post("/", sendSupportEmail);

export { supportRouter };
