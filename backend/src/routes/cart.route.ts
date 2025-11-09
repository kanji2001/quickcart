import { Router } from 'express';
import { addCartItem, clearCart, getCart, removeCartItem, updateCartItem } from '../controllers/cart.controller';
import { protect } from '../middlewares/auth.middleware';
import { validateResource } from '../middlewares/validate.middleware';
import { addCartItemSchema, cartItemParamSchema, updateCartItemSchema } from '../validators/cart.validator';

const router = Router();

router.use(protect);

router.get('/', getCart);
router.post('/items', validateResource(addCartItemSchema), addCartItem);
router.put('/items/:itemId', validateResource(updateCartItemSchema), updateCartItem);
router.delete('/items/:itemId', validateResource(cartItemParamSchema), removeCartItem);
router.delete('/clear', clearCart);

export const cartRouter = router;

