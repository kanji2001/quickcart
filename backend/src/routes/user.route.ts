import { Router } from 'express';
import {
  addAddress,
  changePassword,
  deleteAddress,
  getAddresses,
  getProfile,
  setDefaultAddress,
  updateAddress,
  updateProfile,
} from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';
import { validateResource } from '../middlewares/validate.middleware';
import { upload } from '../middlewares/upload.middleware';
import {
  addressParamSchema,
  addressSchema,
  changePasswordSchema,
  updateProfileSchema,
} from '../validators/user.validator';

const router = Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', upload.single('avatar'), validateResource(updateProfileSchema), updateProfile);
router.put('/change-password', validateResource(changePasswordSchema), changePassword);

router.get('/address', getAddresses);
router.post('/address', validateResource(addressSchema), addAddress);
router.put('/address/:id', validateResource(addressSchema.merge(addressParamSchema)), updateAddress);
router.delete('/address/:id', validateResource(addressParamSchema), deleteAddress);
router.put('/address/:id/default', validateResource(addressParamSchema), setDefaultAddress);

export const userRouter = router;

