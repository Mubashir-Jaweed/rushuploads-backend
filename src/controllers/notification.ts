import { handleErrors } from "@/lib/error";
import { prisma } from "@/lib/prisma";
import { Request, Response } from "express";


async function addNotification(request: Request, response: Response) {
    const { email, description, dateTime } = request.body

    try {
        const notification = await prisma.notification.create({
            data: {
                email,
                description,
                dateTime: new Date(dateTime)
            }
        })
          response.json({ success: true });
    } catch (error) {
        return handleErrors({ response, error });

    }
}


async function getNotifications(request: Request, response: Response) {
    try {
        const notifications = await prisma.notification.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
        return response.success({
            data:{
                notifications: notifications
            }
        })
    } catch (error) {
        return handleErrors({ response, error });
    }
}

export {
    getNotifications, addNotification
}