import { Router } from 'express';
import { addToWishlist, getWishlist, removeFromWishlist } from '../controllers/wishlist.controller';
import { protect } from '../middlewares/auth.middleware';
import { validateResource } from '../middlewares/validate.middleware';
import { addToWishlistSchema, wishlistParamSchema } from '../validators/wishlist.validator';

const router = Router();

router.use(protect);

router.get('/', getWishlist);
router.post('/', validateResource(addToWishlistSchema), addToWishlist);
router.delete('/:productId', validateResource(wishlistParamSchema), removeFromWishlist);

export const wishlistRouter = router;

