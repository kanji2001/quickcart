import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import { ProductModel, WishlistModel } from '../models';
import { successResponse } from '../utils/response';
import { ApiError } from '../utils/api-error';

const getOrCreateWishlist = async (userId: string) => {
  const wishlist = await WishlistModel.findOne({ user: userId }).populate('products');
  if (wishlist) return wishlist;
  return WishlistModel.create({ user: userId, products: [] });
};

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ message: 'Unauthorized', statusCode: StatusCodes.UNAUTHORIZED });
  }

  const wishlist = await getOrCreateWishlist(req.user._id.toString());

  return successResponse(res, {
    message: 'Wishlist fetched successfully',
    data: { wishlist },
  });
});

export const addToWishlist = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ message: 'Unauthorized', statusCode: StatusCodes.UNAUTHORIZED });
  }

  const { productId } = req.body;

  const product = await ProductModel.findById(productId);
  if (!product) {
    throw new ApiError({ message: 'Product not found', statusCode: StatusCodes.NOT_FOUND });
  }

  const wishlist = await getOrCreateWishlist(req.user._id.toString());

  if (!wishlist.products.some((p) => p.toString() === productId)) {
    wishlist.products.push(product._id);
    await wishlist.save();
  }

  return successResponse(res, {
    message: 'Product added to wishlist',
    data: { wishlist },
  });
});

export const removeFromWishlist = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ message: 'Unauthorized', statusCode: StatusCodes.UNAUTHORIZED });
  }

  const { productId } = req.params;

  const wishlist = await getOrCreateWishlist(req.user._id.toString());
  wishlist.products = wishlist.products.filter((product) => product.toString() !== productId);
  await wishlist.save();

  return successResponse(res, {
    message: 'Product removed from wishlist',
    data: { wishlist },
  });
});

