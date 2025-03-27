import { Router } from "express";
import { trackAdView, trackAdClick, getAdStats } from "../controllers/ads";
import { verifyRequest } from "../middlewares/auth";

const adsRouter = Router();

// Public endpoints (called from client side)
adsRouter.post("/view", trackAdView);
adsRouter.post("/click", trackAdClick);

// Admin endpoint
adsRouter.get(
  "/stats",
  verifyRequest({ isVerified: true, role: "ADMIN" }),
  getAdStats
);

export { adsRouter };