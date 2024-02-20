import { checkAuthentication } from '@global/middlewares/auth-middleware';
import { deleteNotification } from '@notification/controllers/delete-notification';
import { getNotifications, updateNotification } from '@service/db/notification.service';
import express from 'express';

const router = express.Router();

router.get('/notifications', checkAuthentication, getNotifications);
router.put('/notification/:notificationId', checkAuthentication, updateNotification);
router.delete('/notification/:notificationId', checkAuthentication, deleteNotification);

export const notificationRoutes = router;
