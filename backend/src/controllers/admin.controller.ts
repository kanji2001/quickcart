import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import { OrderModel, ProductModel, UserModel } from '../models';
import { successResponse } from '../utils/response';
import { ApiError } from '../utils/api-error';
import { getPagination } from '../utils/pagination';

export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const [totalUsers, totalProducts, totalOrders, deliveredOrders, revenueAgg, recentOrders, lowStockProducts] =
    await Promise.all([
      UserModel.countDocuments(),
      ProductModel.countDocuments({ isActive: true }),
      OrderModel.countDocuments(),
      OrderModel.countDocuments({ orderStatus: 'delivered' }),
      OrderModel.aggregate([
        { $match: { paymentStatus: 'completed' } },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$totalAmount' },
          },
        },
      ]),
      OrderModel.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
      ProductModel.find({ stock: { $lt: 5 }, isActive: true }).sort({ stock: 1 }).limit(5),
    ]);

  return successResponse(res, {
    message: 'Dashboard statistics',
    data: {
      totals: {
        users: totalUsers,
        products: totalProducts,
        orders: totalOrders,
        deliveredOrders,
        revenue: revenueAgg[0]?.revenue ?? 0,
      },
      recentOrders,
      lowStockProducts,
    },
  });
});

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination({ page: String(req.query.page ?? '1'), limit: String(req.query.limit ?? '20') });
  const search = String(req.query.search ?? '').trim();

  const filters: Record<string, unknown> = {};

  if (search) {
    filters.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  if (req.query.role) {
    filters.role = req.query.role;
  }

  const [users, total] = await Promise.all([
    UserModel.find(filters).skip(skip).limit(limit).sort({ createdAt: -1 }),
    UserModel.countDocuments(filters),
  ]);

  return successResponse(res, {
    message: 'Users fetched successfully',
    data: {
      items: users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    },
  });
});

export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  const user = await UserModel.findByIdAndUpdate(id, { role }, { new: true, runValidators: true });
  if (!user) {
    throw new ApiError({ message: 'User not found', statusCode: StatusCodes.NOT_FOUND });
  }

  return successResponse(res, {
    message: 'User role updated',
    data: { user },
  });
});

export const toggleUserBlock = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isBlocked } = req.body;

  const user = await UserModel.findByIdAndUpdate(id, { isBlocked }, { new: true, runValidators: true });

  if (!user) {
    throw new ApiError({ message: 'User not found', statusCode: StatusCodes.NOT_FOUND });
  }

  return successResponse(res, {
    message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
    data: { user },
  });
});

export const getAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  const salesByMonth = await OrderModel.aggregate([
    { $match: { createdAt: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        total: { $sum: '$totalAmount' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const productPerformance = await OrderModel.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        totalSold: { $sum: '$items.quantity' },
        revenue: { $sum: '$items.subtotal' },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 },
  ]);

  return successResponse(res, {
    message: 'Analytics data',
    data: {
      salesByMonth,
      productPerformance,
    },
  });
});

