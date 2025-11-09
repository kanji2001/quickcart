import { Router } from 'express';
import {
  getAnalytics,
  getDashboardStats,
  getUsers,
  toggleUserBlock,
  updateUserRole,
} from '../controllers/admin.controller';
import { isAdmin, protect } from '../middlewares/auth.middleware';
import { validateResource } from '../middlewares/validate.middleware';
import { toggleUserBlockSchema, updateUserRoleSchema } from '../validators/admin.validator';

const router = Router();

router.use(protect, isAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/role', validateResource(updateUserRoleSchema), updateUserRole);
router.put('/users/:id/block', validateResource(toggleUserBlockSchema), toggleUserBlock);
router.get('/analytics', getAnalytics);

export const adminRouter = router;

