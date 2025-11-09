import { Router } from 'express';
import {
  createCategory,
  deleteCategory,
  getCategory,
  listCategories,
  updateCategory,
} from '../controllers/category.controller';
import { protect, isAdmin } from '../middlewares/auth.middleware';
import { validateResource } from '../middlewares/validate.middleware';
import {
  categoryIdParamSchema,
  categorySlugParamSchema,
  createCategorySchema,
  updateCategorySchema,
} from '../validators/category.validator';

const router = Router();

router.get('/', listCategories);
router.get('/:idOrSlug', validateResource(categorySlugParamSchema), getCategory);

router.post('/', protect, isAdmin, validateResource(createCategorySchema), createCategory);
router.put('/:id', protect, isAdmin, validateResource(updateCategorySchema), updateCategory);
router.delete('/:id', protect, isAdmin, validateResource(categoryIdParamSchema), deleteCategory);

export const categoryRouter = router;

