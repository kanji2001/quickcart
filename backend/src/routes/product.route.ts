import { Router } from 'express';
import {
  createProduct,
  createProductReview,
  deleteProduct,
  getFeaturedProducts,
  getNewArrivals,
  getProduct,
  getProductReviews,
  getRelatedProducts,
  getTrendingProducts,
  listProducts,
  updateProduct,
} from '../controllers/product.controller';
import { protect, isAdmin } from '../middlewares/auth.middleware';
import { validateResource } from '../middlewares/validate.middleware';
import {
  createProductSchema,
  createReviewSchema,
  productIdParamSchema,
  productSlugParamSchema,
  updateProductSchema,
} from '../validators/product.validator';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.get('/', listProducts);
router.get('/featured', getFeaturedProducts);
router.get('/trending', getTrendingProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/:idOrSlug', validateResource(productSlugParamSchema), getProduct);
router.get('/:id/reviews', validateResource(productIdParamSchema), getProductReviews);
router.get('/:idOrSlug/related', validateResource(productSlugParamSchema), getRelatedProducts);

router.post('/', protect, isAdmin, upload.single('image'), validateResource(createProductSchema), createProduct);
router.put('/:id', protect, isAdmin, validateResource(updateProductSchema), updateProduct);
router.delete('/:id', protect, isAdmin, validateResource(productIdParamSchema), deleteProduct);

router.post('/:id/reviews', protect, validateResource(createReviewSchema), createProductReview);

export const productRouter = router;

