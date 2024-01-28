import { checkAuthentication } from '@global/middlewares/auth-middleware';
import { addBackgroundImage, addProfileImage } from '@image/controllers/add-image';
import { deleteBackgroundImage, deleteImage } from '@image/controllers/delete-image';
import { getImages } from '@image/controllers/get-images';
import { Router } from 'express';

const router = Router();

router.get('/images/:userId', checkAuthentication, getImages);
router.post('/images/profile', checkAuthentication, addProfileImage);
router.post('/images/background', checkAuthentication, addBackgroundImage);
router.delete('/images/:imageId', checkAuthentication, deleteImage);
router.delete('/images/background/:bgImageId', checkAuthentication, deleteBackgroundImage);

export const imageRoutes = router;
