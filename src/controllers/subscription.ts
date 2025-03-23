import type { Request, Response } from "express";

import { TierToPriceIdMap } from "../constants/tiers";
import { env } from "../lib/env";
import { BadResponse, handleErrors } from "../lib/error";
import { stripe } from "../lib/stripe";
import {
  createCheckoutSession,
  createPortalSession,
  getSubscriptionByUserId,
  handlePaymentFailure,
  handlePaymentSuccess,
  handleSubscriptionCreated,
  handleSubscriptionDeleted,
  handleSubscriptionUpdated,
} from "../services/subscription";
import { createCheckoutQuerySchema } from "../validators/subscription";

async function createCheckout(request: Request, response: Response) {
  try {
    const { tier } = createCheckoutQuerySchema.parse(request.query);

    const priceId = TierToPriceIdMap[tier];

    const { session } = await createCheckoutSession({
      userId: request.user.id,
      userEmail: request.user.email,
      priceId,
    });

    return response.created(
      {
        data: {
          url: session.url,
        },
      },
      {
        message: "Checkout Session Created!",
      },
    );
  } catch (error) {
    return handleErrors({ response, error });
  }
}

async function createPortal(request: Request, response: Response) {
  try {
    const { subscription } = await getSubscriptionByUserId({
      userId: request.user.id,
    });

    if (!subscription?.customerId) {
      throw new BadResponse("Customer Not Found!");
    }

    const { session } = await createPortalSession({
      customerId: subscription.customerId,
    });

    return response.created(
      {
        data: {
          url: session.url,
        },
      },
      {
        message: "Portal Session Created!",
      },
    );
  } catch (error) {
    return handleErrors({ response, error });
  }
}

async function stripeWebhook(request: Request, response: Response) {
  try {
    const sig = request.headers["stripe-signature"] as string;

    const event = stripe.webhooks.constructEvent(
      request.body,
      sig,
      env.STRIPE_WEBHOOK_SECRET_KEY,
    );

    switch (event.type) {
      case "customer.subscription.created":
        await handleSubscriptionCreated({ event });
        break;
      case "invoice.payment_succeeded":
        await handlePaymentSuccess({ event });
        break;
      case "invoice.payment_failed":
        await handlePaymentFailure({ event });
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated({ event });
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted({ event });
        break;
      default:
        console.log(`Unhandled Event: ${event.type}`);
        break;
    }

    return response.success({}, { message: "Webhook Processed!" });
  } catch (error) {
    console.error("Webhook Error:", error);
    return handleErrors({ response, error });
  }
}

export { createCheckout, createPortal, stripeWebhook };
