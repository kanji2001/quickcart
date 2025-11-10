import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import { CartModel, ProductModel } from '../models';
import { successResponse } from '../utils/response';
import { ApiError } from '../utils/api-error';

const getOrCreateCart = async (userId: string) => {
  const cart = await CartModel.findOne({ user: userId }).populate('items.product');
  if (cart) return cart;

  return CartModel.create({ user: userId, items: [] });
};

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ message: 'Unauthorized', statusCode: StatusCodes.UNAUTHORIZED });
  }

  const cart = await getOrCreateCart(req.user._id.toString());

  return successResponse(res, {
    message: 'Cart fetched successfully',
    data: { cart },
  });
});

export const addCartItem = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ message: 'Unauthorized', statusCode: StatusCodes.UNAUTHORIZED });
  }

  const { productId, quantity } = req.body;

  const product = await ProductModel.findById(productId);
  if (!product || !product.isActive) {
    throw new ApiError({ message: 'Product not available', statusCode: StatusCodes.NOT_FOUND });
  }

  if (product.stock < quantity) {
    throw new ApiError({ message: 'Insufficient stock', statusCode: StatusCodes.BAD_REQUEST });
  }

  const cart = await getOrCreateCart(req.user._id.toString());

  const existingItem = cart.items.find((item) => item.product.toString() === productId);
  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (product.stock < newQuantity) {
      throw new ApiError({ message: 'Insufficient stock', statusCode: StatusCodes.BAD_REQUEST });
    }
    existingItem.quantity = newQuantity;
    existingItem.price = product.discountPrice ?? product.price;
  } else {
    cart.items.push({
      product: product._id,
      quantity,
      price: product.discountPrice ?? product.price,
    });
  }

  cart.calculateTotals();
  await cart.save();

  return successResponse(res, {
    message: 'Cart updated successfully',
    statusCode: StatusCodes.CREATED,
    data: { cart },
  });
});

export const updateCartItem = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ message: 'Unauthorized', statusCode: StatusCodes.UNAUTHORIZED });
  }

  const { itemId } = req.params;
  const { quantity } = req.body;

  const cart = await getOrCreateCart(req.user._id.toString());
  const item = cart.items.id(itemId);

  if (!item) {
    throw new ApiError({ message: 'Cart item not found', statusCode: StatusCodes.NOT_FOUND });
  }

  if (quantity <= 0) {
    item.deleteOne();
  } else {
    const product = await ProductModel.findById(item.product);
    if (!product) {
      throw new ApiError({ message: 'Product not found', statusCode: StatusCodes.NOT_FOUND });
    }
    if (product.stock < quantity) {
      throw new ApiError({ message: 'Insufficient stock', statusCode: StatusCodes.BAD_REQUEST });
    }
    item.quantity = quantity;
    item.price = product.discountPrice ?? product.price;
  }

  cart.calculateTotals();
  await cart.save();

  return successResponse(res, {
    message: 'Cart item updated',
    data: { cart },
  });
});

export const removeCartItem = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ message: 'Unauthorized', statusCode: StatusCodes.UNAUTHORIZED });
  }

  const { itemId } = req.params;

  const cart = await getOrCreateCart(req.user._id.toString());
  const item = cart.items.id(itemId);

  if (!item) {
    throw new ApiError({ message: 'Cart item not found', statusCode: StatusCodes.NOT_FOUND });
  }

  item.deleteOne();
  cart.calculateTotals();
  await cart.save();

  return successResponse(res, {
    message: 'Item removed from cart',
    data: { cart },
  });
});

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ message: 'Unauthorized', statusCode: StatusCodes.UNAUTHORIZED });
  }

  const cart = await getOrCreateCart(req.user._id.toString());
  cart.items = [];
  cart.totalAmount = 0;
  cart.totalItems = 0;
  await cart.save();

  return successResponse(res, {
    message: 'Cart cleared successfully',
    data: { cart },
  });
});

