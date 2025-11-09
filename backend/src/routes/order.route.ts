import { Router } from 'express';
import {
  cancelOrder,
  createOrder,
  getAllOrders,
  getOrder,
  getOrders,
  updateOrderStatus,
} from '../controllers/order.controller';
import { isAdmin, protect } from '../middlewares/auth.middleware';
import { validateResource } from '../middlewares/validate.middleware';
import {
  cancelOrderSchema,
  createOrderSchema,
  orderIdParamSchema,
  updateOrderStatusSchema,
} from '../validators/order.validator';

const router = Router();

router.use(protect);

router.post('/', validateResource(createOrderSchema), createOrder);
router.get('/', getOrders);
router.get('/admin/all', isAdmin, getAllOrders);
router.put('/:id/status', isAdmin, validateResource(updateOrderStatusSchema), updateOrderStatus);
router.get('/:id', validateResource(orderIdParamSchema), getOrder);
router.put('/:id/cancel', validateResource(cancelOrderSchema), cancelOrder);

export const orderRouter = router;

