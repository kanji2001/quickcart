import { Router } from 'express';
import {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  getApplicableCoupons,
} from '../controllers/coupon.controller';
import { protect, isAdmin } from '../middlewares/auth.middleware';
import { validateResource } from '../middlewares/validate.middleware';
import {
  couponIdParamSchema,
  createCouponSchema,
  updateCouponSchema,
  validateCouponSchema,
  toggleCouponSchema,
  availableCouponsSchema,
} from '../validators/coupon.validator';

const router = Router();

router.post('/validate', protect, validateResource(validateCouponSchema), validateCoupon);
router.get('/available', protect, validateResource(availableCouponsSchema), getApplicableCoupons);

router.use(protect, isAdmin);
router.get('/', getCoupons);
router.post('/', validateResource(createCouponSchema), createCoupon);
router.put('/:id', validateResource(updateCouponSchema), updateCoupon);
router.patch('/:id/toggle', validateResource(toggleCouponSchema), toggleCouponStatus);
router.delete('/:id', validateResource(couponIdParamSchema), deleteCoupon);

export const couponRouter = router;

