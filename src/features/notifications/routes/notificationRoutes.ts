import { checkAuthentication } from '@global/middlewares/auth-middleware';
import { deleteNotification } from '@notification/controllers/delete-notification';
import { getNotifications } from '@notification/controllers/get-notifications';
import { updateNotification } from '@notification/controllers/update-notification';
import express from 'express';

const router = express.Router();

router.get('/notifications', checkAuthentication, getNotifications);
router.put('/notification/:notificationId', checkAuthentication, updateNotification);
router.delete('/notification/:notificationId', checkAuthentication, deleteNotification);

export const notificationRoutes = router;
