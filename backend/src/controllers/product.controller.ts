import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { ProductModel, ReviewModel, OrderModel } from '../models';
import { successResponse } from '../utils/response';
import { ApiError } from '../utils/api-error';
import { getPagination } from '../utils/pagination';
import { uploadToCloudinary } from '../services/cloudinary.service';

const buildProductFilters = (query: Request['query']) => {
  const filters: Record<string, unknown> = {
    isActive: true,
  };

  if (query.category) {
    filters.category = new mongoose.Types.ObjectId(String(query.category));
  }

  if (query.subCategory) {
    filters.subCategory = new mongoose.Types.ObjectId(String(query.subCategory));
  }

  if (query.brand) {
    filters.brand = query.brand;
  }

  if (query.isFeatured) {
    filters.isFeatured = query.isFeatured === 'true';
  }

  if (query.isNew) {
    filters.isNew = query.isNew === 'true';
  }

  if (query.isTrending) {
    filters.isTrending = query.isTrending === 'true';
  }

  if (query.minPrice || query.maxPrice) {
    filters.price = {
      ...(query.minPrice ? { $gte: Number(query.minPrice) } : {}),
      ...(query.maxPrice ? { $lte: Number(query.maxPrice) } : {}),
    };
  }

  if (query.rating) {
    filters.rating = { $gte: Number(query.rating) };
  }

  if (query.search) {
    filters.$text = { $search: String(query.search) };
  }

  if (query.tags) {
    const tags = Array.isArray(query.tags) ? query.tags : String(query.tags).split(',');
    filters.tags = { $in: tags.map((tag) => tag.trim()) };
  }

  return filters;
};

const getSortingOption = (sort?: string | string[]) => {
  if (!sort) return { createdAt: -1 };
  const sortValue = Array.isArray(sort) ? sort[0] : sort;
  switch (sortValue) {
    case 'price':
      return { price: 1 };
    case '-price':
      return { price: -1 };
    case 'rating':
      return { rating: -1 };
    case 'newest':
      return { createdAt: -1 };
    case 'popular':
      return { sold: -1 };
    default:
      return { createdAt: -1 };
  }
};

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const filters = buildProductFilters(req.query);
  const { page, limit, skip } = getPagination({ page: String(req.query.page ?? '1'), limit: String(req.query.limit ?? '10') });
  const sort = getSortingOption(req.query.sort);

  const [products, total] = await Promise.all([
    ProductModel.find(filters)
      .populate('category')
      .skip(skip)
      .limit(limit)
      .sort(sort),
    ProductModel.countDocuments(filters),
  ]);

  return successResponse(res, {
    message: 'Products fetched successfully',
    data: {
      items: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
      filters: req.query,
    },
  });
});

export const getFeaturedProducts = asyncHandler(async (_req: Request, res: Response) => {
  const products = await ProductModel.getFeatured(12);

  return successResponse(res, {
    message: 'Featured products fetched successfully',
    data: { items: products },
  });
});

export const getTrendingProducts = asyncHandler(async (_req: Request, res: Response) => {
  const products = await ProductModel.find({ isTrending: true, isActive: true }).sort({ createdAt: -1 }).limit(12);

  return successResponse(res, {
    message: 'Trending products fetched successfully',
    data: { items: products },
  });
});

export const getNewArrivals = asyncHandler(async (_req: Request, res: Response) => {
  const products = await ProductModel.find({ isNew: true, isActive: true }).sort({ createdAt: -1 }).limit(12);

  return successResponse(res, {
    message: 'New arrivals fetched successfully',
    data: { items: products },
  });
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const { idOrSlug } = req.params;

  const product = await ProductModel.findOne(
    mongoose.isValidObjectId(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug },
  )
    .populate('category')
    .populate('subCategory');

  if (!product) {
    throw new ApiError({ message: 'Product not found', statusCode: StatusCodes.NOT_FOUND });
  }

  return successResponse(res, {
    message: 'Product fetched successfully',
    data: { product },
  });
});

export const getProductReviews = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { page, limit, skip } = getPagination({ page: String(req.query.page ?? '1'), limit: String(req.query.limit ?? '10') });
  const [reviews, total] = await Promise.all([
    ReviewModel.find({ product: id })
      .populate('user', 'name avatar')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    ReviewModel.countDocuments({ product: id }),
  ]);

  return successResponse(res, {
    message: 'Reviews fetched successfully',
    data: {
      items: reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    },
  });
});

export const getRelatedProducts = asyncHandler(async (req: Request, res: Response) => {
  const { idOrSlug } = req.params as { idOrSlug: string };
  const current = await ProductModel.findOne(
    mongoose.isValidObjectId(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug },
  );

  if (!current) {
    throw new ApiError({ message: 'Product not found', statusCode: StatusCodes.NOT_FOUND });
  }

  const products = await ProductModel.find({
    _id: { $ne: current._id },
    category: current.category,
    isActive: true,
  })
    .limit(8)
    .sort({ createdAt: -1 });

  return successResponse(res, {
    message: 'Related products fetched successfully',
    data: { items: products },
  });
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const {
    tags: incomingTags,
    features: incomingFeatures,
    ...body
  } = req.body as unknown as {
    tags?: string[] | string;
    features?: string[] | string;
  } & Record<string, any>;

  const tags = Array.isArray(incomingTags)
    ? incomingTags.filter((tag) => typeof tag === 'string' && tag.trim().length)
    : incomingTags
    ? [incomingTags].filter((tag) => typeof tag === 'string' && tag.trim().length)
    : [];

  const features = Array.isArray(incomingFeatures)
    ? incomingFeatures.filter((feature) => typeof feature === 'string' && feature.trim().length)
    : incomingFeatures
    ? [incomingFeatures].filter((feature) => typeof feature === 'string' && feature.trim().length)
    : [];

  const productPayload: Record<string, unknown> = {
    ...body,
    tags,
    features,
  };

  if (body.price !== undefined) {
    const price = Number(body.price);
    if (Number.isNaN(price)) {
      throw new ApiError({ message: 'Invalid price', statusCode: StatusCodes.BAD_REQUEST });
    }
    productPayload.price = price;
  }

  if (body.discountPrice !== undefined && body.discountPrice !== '') {
    const discountPrice = Number(body.discountPrice);
    if (Number.isNaN(discountPrice)) {
      throw new ApiError({ message: 'Invalid discount price', statusCode: StatusCodes.BAD_REQUEST });
    }
    productPayload.discountPrice = discountPrice;
  }

  if (body.stock !== undefined) {
    const stock = Number(body.stock);
    if (Number.isNaN(stock)) {
      throw new ApiError({ message: 'Invalid stock value', statusCode: StatusCodes.BAD_REQUEST });
    }
    productPayload.stock = stock;
  }

  if (body.isActive !== undefined) {
    productPayload.isActive = ['true', '1', true].includes(body.isActive);
  }

  if (body.isFeatured !== undefined) {
    productPayload.isFeatured = ['true', '1', true].includes(body.isFeatured);
  }
  if (body.isNew !== undefined) {
    productPayload.isNew = ['true', '1', true].includes(body.isNew);
  }
  if (body.isTrending !== undefined) {
    productPayload.isTrending = ['true', '1', true].includes(body.isTrending);
  }

  if (req.file) {
    const uploadResult = await uploadToCloudinary(
      req.file.buffer,
      `quickcart/products/${body.slug ?? 'general'}`,
    );

    const imagePayload = {
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url,
    };

    productPayload.images = [imagePayload];
    productPayload.thumbnail = imagePayload;
  }

  const product = await ProductModel.create(productPayload);

  return successResponse(res, {
    message: 'Product created successfully',
    statusCode: StatusCodes.CREATED,
    data: { product },
  });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await ProductModel.findByIdAndUpdate(
    id,
    {
      ...req.body,
      updatedAt: new Date(),
    },
    { new: true, runValidators: true },
  );

  if (!product) {
    throw new ApiError({ message: 'Product not found', statusCode: StatusCodes.NOT_FOUND });
  }

  return successResponse(res, {
    message: 'Product updated successfully',
    data: { product },
  });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await ProductModel.findById(id);

  if (!product) {
    throw new ApiError({ message: 'Product not found', statusCode: StatusCodes.NOT_FOUND });
  }

  await product.deleteOne();

  return successResponse(res, {
    message: 'Product deleted successfully',
    data: { productId: id },
  });
});

export const createProductReview = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ message: 'Unauthorized', statusCode: StatusCodes.UNAUTHORIZED });
  }
  const { id } = req.params;
  const { rating, comment, images } = req.body;

  const product = await ProductModel.findById(id);
  if (!product) {
    throw new ApiError({ message: 'Product not found', statusCode: StatusCodes.NOT_FOUND });
  }

  const order = await OrderModel.findOne({
    user: req.user._id,
    'items.product': product._id,
    orderStatus: { $in: ['delivered', 'processing', 'shipped'] },
  });

  const review = await ReviewModel.create({
    product: product._id,
    user: req.user._id,
    order: order?._id,
    rating,
    comment,
    images: images ?? [],
    isVerifiedPurchase: Boolean(order),
  });

  const ratingsAgg = await ReviewModel.aggregate([
    { $match: { product: product._id } },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  const stats = ratingsAgg[0];
  product.rating = stats?.averageRating ?? product.rating;
  product.numReviews = stats?.numReviews ?? product.numReviews;
  await product.save({ validateBeforeSave: false });

  return successResponse(res, {
    message: 'Review submitted successfully',
    statusCode: StatusCodes.CREATED,
    data: { review },
  });
});

