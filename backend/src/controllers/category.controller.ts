import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { CategoryModel, ProductModel } from '../models';
import { successResponse } from '../utils/response';
import { ApiError } from '../utils/api-error';

export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await CategoryModel.find({ isActive: true }).sort({ name: 1 });

  return successResponse(res, {
    message: 'Categories fetched successfully',
    data: { items: categories },
  });
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const { idOrSlug } = req.params;

  const category = await CategoryModel.findOne(
    mongoose.isValidObjectId(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug },
  );

  if (!category) {
    throw new ApiError({ message: 'Category not found', statusCode: StatusCodes.NOT_FOUND });
  }

  return successResponse(res, {
    message: 'Category fetched successfully',
    data: { category },
  });
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await CategoryModel.create(req.body);

  return successResponse(res, {
    message: 'Category created successfully',
    statusCode: StatusCodes.CREATED,
    data: { category },
  });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const category = await CategoryModel.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

  if (!category) {
    throw new ApiError({ message: 'Category not found', statusCode: StatusCodes.NOT_FOUND });
  }

  return successResponse(res, {
    message: 'Category updated successfully',
    data: { category },
  });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const category = await CategoryModel.findById(id);

  if (!category) {
    throw new ApiError({ message: 'Category not found', statusCode: StatusCodes.NOT_FOUND });
  }

  const productsUsingCategory = await ProductModel.countDocuments({ category: category._id });

  if (productsUsingCategory > 0) {
    throw new ApiError({
      message: 'Category cannot be deleted because it is associated with products',
      statusCode: StatusCodes.CONFLICT,
    });
  }

  await category.deleteOne();

  return successResponse(res, {
    message: 'Category deleted successfully',
  });
});

