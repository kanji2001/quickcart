import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { AddressModel, CartModel, CouponModel, OrderModel, ProductModel } from '../models';
import { successResponse } from '../utils/response';
import { ApiError } from '../utils/api-error';
import { getPagination } from '../utils/pagination';

const calculateOrderTotals = async (
  items: Array<{ product: mongoose.Types.ObjectId; quantity: number; price: number; subtotal: number }>,
  couponCode?: string,
) => {
  const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
  let discountAmount = 0;

  if (couponCode) {
    const coupon = await CouponModel.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() },
    });

    if (coupon) {
      if (coupon.discountType === 'percentage') {
        discountAmount = Math.min((subtotal * coupon.discountValue) / 100, coupon.maxDiscountAmount ?? Infinity);
      } else {
        discountAmount = coupon.discountValue;
      }
    }
  }

  const taxAmount = subtotal * 0.18; // placeholder GST 18%
  const shippingCharges = subtotal > 999 ? 0 : 59;
  const totalAmount = subtotal - discountAmount + taxAmount + shippingCharges;

  return {
    subtotal,
    discountAmount,
    taxAmount,
    shippingCharges,
    totalAmount,
  };
};

const normalizeAddressForComparison = (address: any) => ({
  fullName: address.fullName?.trim(),
  phone: address.phone?.trim(),
  addressLine1: address.addressLine1?.trim(),
  addressLine2: address.addressLine2?.trim() || undefined,
  city: address.city?.trim(),
  state: address.state?.trim(),
  pincode: address.pincode?.trim(),
  country: address.country?.trim(),
});

const upsertDefaultAddress = async (
  userId: mongoose.Types.ObjectId,
  address: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  },
) => {
  const normalized = normalizeAddressForComparison(address);

  const existing = await AddressModel.findOne({
    user: userId,
    ...normalized,
  });

  let defaultAddress;

  if (existing) {
    existing.set({ ...address, isDefault: true });
    defaultAddress = await existing.save();
  } else {
    defaultAddress = await AddressModel.create({
      user: userId,
      ...address,
      isDefault: true,
    });
  }

  await AddressModel.updateMany(
    { user: userId, _id: { $ne: defaultAddress._id } },
    { $set: { isDefault: false } },
  );

  return defaultAddress;
};

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ message: 'Unauthorized', statusCode: StatusCodes.UNAUTHORIZED });
  }

  const { items, shippingAddress, billingAddress, paymentMethod, couponCode, saveAddress } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError({ message: 'Order items are required', statusCode: StatusCodes.BAD_REQUEST });
  }

  const productIds = items.map((item) => new mongoose.Types.ObjectId(item.productId));
  const products = await ProductModel.find({ _id: { $in: productIds } });

  const enrichedItems = items.map((item) => {
    const product = products.find((p) => p._id.equals(item.productId));
    if (!product) {
      throw new ApiError({ message: 'Product not found', statusCode: StatusCodes.NOT_FOUND });
    }
    if (product.stock < item.quantity) {
      throw new ApiError({ message: `Insufficient stock for ${product.name}`, statusCode: StatusCodes.BAD_REQUEST });
    }
    return {
      product: product._id,
      productName: product.name,
      productImage: product.thumbnail?.url,
      price: product.discountPrice ?? product.price,
      quantity: item.quantity,
      subtotal: (product.discountPrice ?? product.price) * item.quantity,
    };
  });

  const totals = await calculateOrderTotals(enrichedItems, couponCode);

  const order = await OrderModel.create({
    user: req.user._id,
    items: enrichedItems,
    shippingAddress,
    billingAddress,
    paymentMethod,
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
    orderStatus: 'pending',
    couponCode,
    ...totals,
  });

  await Promise.all(
    enrichedItems.map((item) =>
      ProductModel.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, sold: item.quantity },
      }),
    ),
  );

  if (couponCode) {
    await CouponModel.findOneAndUpdate({ code: couponCode.toUpperCase() }, { $inc: { usageCount: 1 } });
  }

  await CartModel.findOneAndUpdate({ user: req.user._id }, { items: [], totalAmount: 0, totalItems: 0 });

  if (saveAddress) {
    await upsertDefaultAddress(req.user._id, shippingAddress);
  }

  return successResponse(res, {
    message: 'Order placed successfully',
    statusCode: StatusCodes.CREATED,
    data: { order },
  });
});

export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ message: 'Unauthorized', statusCode: StatusCodes.UNAUTHORIZED });
  }

  const { page, limit, skip } = getPagination({ page: String(req.query.page ?? '1'), limit: String(req.query.limit ?? '10') });
  const status = req.query.status as string | undefined;

  const filters: Record<string, unknown> = { user: req.user._id };
  if (status) {
    filters.orderStatus = status;
  }

  const [orders, total] = await Promise.all([
    OrderModel.find(filters).skip(skip).limit(limit).sort({ createdAt: -1 }),
    OrderModel.countDocuments(filters),
  ]);

  return successResponse(res, {
    message: 'Orders fetched successfully',
    data: {
      items: orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    },
  });
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ message: 'Unauthorized', statusCode: StatusCodes.UNAUTHORIZED });
  }

  const { id } = req.params;

  const order = await OrderModel.findOne({ _id: id, user: req.user._id }).populate('items.product');

  if (!order) {
    throw new ApiError({ message: 'Order not found', statusCode: StatusCodes.NOT_FOUND });
  }

  return successResponse(res, {
    message: 'Order fetched successfully',
    data: { order },
  });
});

export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ message: 'Unauthorized', statusCode: StatusCodes.UNAUTHORIZED });
  }

  const { id } = req.params;
  const { reason } = req.body;

  const order = await OrderModel.findOne({ _id: id, user: req.user._id });

  if (!order) {
    throw new ApiError({ message: 'Order not found', statusCode: StatusCodes.NOT_FOUND });
  }

  if (!['pending', 'processing'].includes(order.orderStatus)) {
    throw new ApiError({ message: 'Order cannot be cancelled at this stage', statusCode: StatusCodes.BAD_REQUEST });
  }

  order.orderStatus = 'cancelled';
  order.cancelledAt = new Date();
  order.cancellationReason = reason;
  order.statusHistory.push({ status: 'cancelled', date: new Date(), note: reason });
  await order.save();

  await Promise.all(
    order.items.map((item) =>
      ProductModel.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, sold: -item.quantity },
      }),
    ),
  );

  return successResponse(res, {
    message: 'Order cancelled',
    data: { order },
  });
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, note } = req.body;

  const order = await OrderModel.findById(id);

  if (!order) {
    throw new ApiError({ message: 'Order not found', statusCode: StatusCodes.NOT_FOUND });
  }

  order.addStatusHistory(status, note);
  await order.save();

  return successResponse(res, {
    message: 'Order status updated',
    data: { order },
  });
});

export const getAllOrders = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination({ page: String(req.query.page ?? '1'), limit: String(req.query.limit ?? '20') });
  const filters: Record<string, unknown> = {};

  if (req.query.status) {
    filters.orderStatus = req.query.status;
  }

  const [orders, total] = await Promise.all([
    OrderModel.find(filters).skip(skip).limit(limit).sort({ createdAt: -1 }).populate('user', 'name email'),
    OrderModel.countDocuments(filters),
  ]);

  return successResponse(res, {
    message: 'Orders fetched successfully',
    data: {
      items: orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    },
  });
});

