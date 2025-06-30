import { Router } from "express";
import { verifyRequest } from "../middlewares/auth";
import { addNotification, getNotifications } from "@/controllers/notification";


const notificatioRouter = Router();

notificatioRouter.get(
    '/all',
    verifyRequest({isVerified:true, role:'ADMIN'}),
    getNotifications
)
notificatioRouter.post(
    '/one',
    verifyRequest({isVerified:true, role:'ADMIN'}),
    addNotification
)


export {notificatioRouter};