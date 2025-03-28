import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { handleErrors } from "../lib/error";

// Track ad view
  async function trackAdView(request: Request, response: Response) {
  try {
    const monetizationSetting = await prisma.setting.findUnique({
      where: { key: 'monetization' },
      select: { value: true }
    });

    if (!monetizationSetting || monetizationSetting.value?.value !== 'ON') {
      return response.status(400).json({ error: 'Ad monetization not active' });
    }

    // Rest of your tracking logic
    await prisma.adView.create({
      data: {
        setting: { connect: { key: 'monetization' } }
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
      where: { key: 'monetization' },
      select: { value: true }
    });

    if (!monetizationSetting || monetizationSetting.value?.value !== 'ON') {
      return response.status(400).json({ error: 'Ad monetization not active' });
    }

    await prisma.adClick.create({
      data: {
        setting: { connect: { key: 'monetization' } }
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
          createdAt: { not: undefined } // Proper null check
        }
      }),
      prisma.adClick.count({
        where: { 
          settingId: monetizationSetting.id,
          createdAt: { not: undefined }
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