import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { handleErrors } from "../lib/error";

// Track ad view
 async function trackAdView(request: Request, response: Response) {
  try {
    const monetizationSetting = await prisma.setting.findUnique({
      where: { key: 'monetization' }
    });

    if (!monetizationSetting || monetizationSetting.value !== 'ON') {
      return response.status(400).json({ error: 'Ad monetization not active' });
    }

    await prisma.adView.create({
      data: {
        settingId: monetizationSetting.id
      }
    });

    return response.json({ success: true });
  } catch (error) {
    return handleErrors({ response, error });
  }
}

// Track ad click
 async function trackAdClick(request: Request, response: Response) {
  try {
    const monetizationSetting = await prisma.setting.findUnique({
      where: { key: 'monetization' }
    });

    if (!monetizationSetting || monetizationSetting.value !== 'ON') {
      return response.status(400).json({ error: 'Ad monetization not active' });
    }

    await prisma.adClick.create({
      data: {
        settingId: monetizationSetting.id
      }
    });

    return response.json({ success: true });
  } catch (error) {
    return handleErrors({ response, error });
  }
}

// Get ad statistics
 async function getAdStats(request: Request, response: Response) {
    try {
      const monetizationSetting = await prisma.setting.findUnique({
        where: { key: 'monetization' },
        select: { id: true }
      });
  
      if (!monetizationSetting) {
        return response.success({
          data: { views: 0, clicks: 0 }
        });
      }
  
      const [views, clicks] = await Promise.all([
        prisma.adView.count({
          where: { 
            settingId: monetizationSetting.id,
            createdAt: {
              not: null,
              // Add explicit type conversion for safety
              lte: new Date(),
              gte: new Date(0) // Unix epoch start
            }
          }
        }),
        prisma.adClick.count({
          where: { 
            settingId: monetizationSetting.id,
            createdAt: {
              not: null,
              lte: new Date(),
              gte: new Date(0)
            }
          }
        })
      ]);
  
      return response.success({
        data: { views, clicks }
      });
    } catch (error) {
      return handleErrors({ response, error });
    }
  }

  export { 
    trackAdView,
    trackAdClick,
    getAdStats
  }