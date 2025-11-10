import { Router } from 'express';
import { healthRouter } from './health.route';
import { authRouter } from './auth.route';
import { productRouter } from './product.route';
import { categoryRouter } from './category.route';
import { cartRouter } from './cart.route';
import { orderRouter } from './order.route';
import { couponRouter } from './coupon.route';
import { userRouter } from './user.route';
import { wishlistRouter } from './wishlist.route';
import { adminRouter } from './admin.route';
import { paymentRouter } from './payment.route';
import { supportRouter } from './support.route';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/products', productRouter);
router.use('/categories', categoryRouter);
router.use('/cart', cartRouter);
router.use('/orders', orderRouter);
router.use('/coupons', couponRouter);
router.use('/user', userRouter);
router.use('/wishlist', wishlistRouter);
router.use('/admin', adminRouter);
router.use('/payment', paymentRouter);
router.use('/support', supportRouter);

export const apiRouter = router;

