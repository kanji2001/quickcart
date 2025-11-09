import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { envConfig } from '../config/env';
import { CategoryModel, CouponModel, ProductModel, UserModel } from '../models';
import { Coupon } from '../types/coupon';
import { Category } from '../types/category';
import { Product } from '../types/product';

type CategorySeed = Omit<Category, '_id' | 'createdAt' | 'updatedAt'> & { slug: string };

const PLACEHOLDER_IMAGE = 'https://res.cloudinary.com/demo/image/upload/v1699999999/quickcart-placeholder.jpg';

const categoriesSeed: CategorySeed[] = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Latest gadgets and electronics for every need.',
    image: { publicId: 'seed/electronics', url: PLACEHOLDER_IMAGE },
    parentCategory: null,
    isActive: true,
  },
  {
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    description: 'Essentials and decor for your home and kitchen.',
    image: { publicId: 'seed/home-kitchen', url: PLACEHOLDER_IMAGE },
    parentCategory: null,
    isActive: true,
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Trendy apparel and accessories for men and women.',
    image: { publicId: 'seed/fashion', url: PLACEHOLDER_IMAGE },
    parentCategory: null,
    isActive: true,
  },
  {
    name: 'Beauty & Health',
    slug: 'beauty-health',
    description: 'Personal care, cosmetics, and wellness products.',
    image: { publicId: 'seed/beauty-health', url: PLACEHOLDER_IMAGE },
    parentCategory: null,
    isActive: true,
  },
  {
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    description: 'Gear and equipment for sports and outdoor activities.',
    image: { publicId: 'seed/sports-outdoors', url: PLACEHOLDER_IMAGE },
    parentCategory: null,
    isActive: true,
  },
  {
    name: 'Books & Stationery',
    slug: 'books-stationery',
    description: 'Books, office supplies, and stationery products.',
    image: { publicId: 'seed/books-stationery', url: PLACEHOLDER_IMAGE },
    parentCategory: null,
    isActive: true,
  },
];

const couponSeed: Coupon[] = [
  {
    code: 'WELCOME10',
    description: 'Flat 10% off on first purchase',
    discountType: 'percentage',
    discountValue: 10,
    minPurchaseAmount: 500,
    maxDiscountAmount: 500,
    usageLimit: 500,
    usageCount: 0,
    userUsageLimit: 1,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
    isActive: true,
    applicableCategories: [],
    applicableProducts: [],
  },
  {
    code: 'FREESHIP',
    description: 'Free shipping on orders above ₹999',
    discountType: 'fixed',
    discountValue: 100,
    minPurchaseAmount: 999,
    maxDiscountAmount: 100,
    usageLimit: 1000,
    usageCount: 0,
    userUsageLimit: 5,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180),
    isActive: true,
    applicableCategories: [],
    applicableProducts: [],
  },
  {
    code: 'FESTIVE20',
    description: 'Festive special 20% off upto ₹1000',
    discountType: 'percentage',
    discountValue: 20,
    minPurchaseAmount: 1500,
    maxDiscountAmount: 1000,
    usageLimit: 300,
    usageCount: 0,
    userUsageLimit: 2,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
    isActive: true,
    applicableCategories: [],
    applicableProducts: [],
  },
];

const productBase: Array<{
  name: string;
  brand: string;
  categorySlug: string;
  basePrice: number;
  tags: string[];
  images: string[];
}> = [
  {
    name: 'Wireless Noise Cancelling Headphones',
    brand: 'SoundSphere',
    categorySlug: 'electronics',
    basePrice: 8999,
    tags: ['audio', 'headphones', 'wireless'],
    images: [
      'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1524678714210-9917a6c619c2?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    name: 'Smart Fitness Tracker Watch',
    brand: 'FitPulse',
    categorySlug: 'electronics',
    basePrice: 4999,
    tags: ['smartwatch', 'fitness'],
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1526406915894-6c3d9f81b45c?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    name: '4K Ultra HD Smart TV 55-inch',
    brand: 'VisionPro',
    categorySlug: 'electronics',
    basePrice: 45999,
    tags: ['television', 'smart-tv'],
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1618005198919-d3d4b5a92eee?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1584999734482-0361aecad844?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    name: 'Robot Vacuum Cleaner',
    brand: 'CleanBot',
    categorySlug: 'home-kitchen',
    basePrice: 18999,
    tags: ['cleaning', 'robot'],
    images: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1604957056325-7e7e92a273d7?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1600585154340-0ef3c08d1452?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    name: 'Stainless Steel Cookware Set',
    brand: 'ChefCraft',
    categorySlug: 'home-kitchen',
    basePrice: 6999,
    tags: ['cookware', 'kitchen'],
    images: [
      'https://images.unsplash.com/photo-1623936960377-4d43fd9bc1a5?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1515007917921-cad9bf0e2f32?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1524594154908-edd0acfa9ff5?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    name: 'Memory Foam Orthopedic Pillow',
    brand: 'CloudRest',
    categorySlug: 'home-kitchen',
    basePrice: 1999,
    tags: ['bedding', 'comfort'],
    images: [
      'https://images.unsplash.com/photo-1600170394963-c8b4c95704f0?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    name: 'Slim Fit Cotton Shirt',
    brand: 'Urban Threads',
    categorySlug: 'fashion',
    basePrice: 1299,
    tags: ['shirt', 'men'],
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    name: 'Women’s Floral Summer Dress',
    brand: 'Bella Moda',
    categorySlug: 'fashion',
    basePrice: 1799,
    tags: ['dress', 'women'],
    images: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    name: 'Unisex Running Shoes',
    brand: 'StrideMax',
    categorySlug: 'fashion',
    basePrice: 2899,
    tags: ['footwear', 'running'],
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1528701800489-20be3c2f5b1f?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    name: 'Vitamin C Face Serum',
    brand: 'GlowLab',
    categorySlug: 'beauty-health',
    basePrice: 1199,
    tags: ['skincare', 'serum'],
    images: [
      'https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1596205250163-caa67177cf0c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    name: 'Herbal Hair Care Kit',
    brand: 'NatureRoot',
    categorySlug: 'beauty-health',
    basePrice: 1499,
    tags: ['haircare', 'herbal'],
    images: [
      'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1583241800698-3e4b6cf6b06f?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    name: 'Resistance Band Set',
    brand: 'FlexFit',
    categorySlug: 'sports-outdoors',
    basePrice: 899,
    tags: ['workout', 'gym'],
    images: [
      'https://images.unsplash.com/photo-1487956382158-bb926046304a?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1594737625785-c66858a24b21?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    name: 'Camping Tent for 4',
    brand: 'Trailblazer',
    categorySlug: 'sports-outdoors',
    basePrice: 5999,
    tags: ['camping', 'outdoor'],
    images: [
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1530543787849-128d94430c6b?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    name: 'Hardcover Notebook Pack',
    brand: 'NoteCraft',
    categorySlug: 'books-stationery',
    basePrice: 699,
    tags: ['stationery', 'notebooks'],
    images: [
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1517842607-9ceccf6a838d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    name: 'Wireless Mechanical Keyboard',
    brand: 'KeyForge',
    categorySlug: 'electronics',
    basePrice: 6499,
    tags: ['keyboard', 'peripherals'],
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1485727749690-d091e8284ef4?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    name: 'Portable Bluetooth Speaker',
    brand: 'BeatBox',
    categorySlug: 'electronics',
    basePrice: 3499,
    tags: ['speaker', 'portable'],
    images: [
      'https://images.unsplash.com/photo-1587899897387-091ebd01a083?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    name: 'Espresso Coffee Machine',
    brand: 'BrewMaster',
    categorySlug: 'home-kitchen',
    basePrice: 12999,
    tags: ['coffee', 'appliance'],
    images: [
      'https://images.unsplash.com/photo-1509477769457-4520f5e73d44?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1459755486867-b55449bb39ff?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    name: 'Air Purifier with HEPA Filter',
    brand: 'PureBreathe',
    categorySlug: 'home-kitchen',
    basePrice: 10999,
    tags: ['air-purifier', 'home'],
    images: [
      'https://images.unsplash.com/photo-1592997571568-72f35cb561b1?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1598300055144-30c1b9a4f763?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1623006325665-a8b9e66bba0b?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    name: 'Men’s Leather Wallet',
    brand: 'ClassicCarry',
    categorySlug: 'fashion',
    basePrice: 1499,
    tags: ['wallet', 'accessories'],
    images: [
      'https://images.unsplash.com/photo-1555525631-13c3da4b338b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=900&q=80',
    ],
  },
  {
    name: 'Yoga Mat with Alignment Lines',
    brand: 'ZenFlex',
    categorySlug: 'sports-outdoors',
    basePrice: 1299,
    tags: ['yoga', 'fitness'],
    images: [
      'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1540206395-68808572332f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1552196560-421154ad5107?auto=format&fit=crop&w=900&q=80',
    ],
  },
];

const generateProducts = (categoryIdBySlug: Map<string, mongoose.Types.ObjectId>): Product[] => {
  const products: Product[] = [];

  productBase.forEach((base, index) => {
    const categoryId = categoryIdBySlug.get(base.categorySlug);
    if (!categoryId) {
      return;
    }

    const variants = Array.from({ length: 3 }).map((_, variantIndex) => {
      const sequence = index * 3 + variantIndex + 1;
      const name = `${base.name} ${variantIndex === 0 ? '' : `Variant ${variantIndex + 1}`}`.trim();
      const price = base.basePrice + variantIndex * 500;
      const discountPrice = variantIndex % 2 === 0 ? Math.round(price * 0.9) : undefined;
      const imageUrls = base.images.length ? base.images : [PLACEHOLDER_IMAGE];

      return {
        name,
        slug: `${name.toLowerCase().replace(/\s+/g, '-')}-${sequence}`,
        description: `Experience premium quality with the ${name}. Designed by ${base.brand} for everyday use.`,
        price,
        discountPrice,
        category: categoryId,
        brand: base.brand,
        sku: `QC-${sequence.toString().padStart(5, '0')}`,
        stock: 25 + variantIndex * 10,
        sold: 0,
        images: imageUrls.map((url, imageIndex) => ({
          publicId: `seed/products/${sequence}-${imageIndex + 1}`,
          url,
        })),
        thumbnail: {
          publicId: `seed/products/${sequence}-thumb`,
          url: imageUrls[0] ?? PLACEHOLDER_IMAGE,
        },
        features: [
          'Premium build quality',
          'One year warranty',
          'Trusted brand support',
        ],
        specifications: {
          weight: `${(1.2 + variantIndex * 0.2).toFixed(1)} kg`,
          color: variantIndex === 0 ? 'Black' : variantIndex === 1 ? 'Midnight Blue' : 'Crimson Red',
          model: `QC-${sequence}`,
        },
        rating: 0,
        numReviews: 0,
        isFeatured: sequence % 4 === 0,
        isNew: sequence % 3 === 0,
        isTrending: sequence % 5 === 0,
        isActive: true,
        tags: base.tags,
        weight: 1 + variantIndex * 0.5,
        dimensions: {
          length: 20 + variantIndex * 2,
          width: 15 + variantIndex * 1.5,
          height: 8 + variantIndex,
        },
      };
    });

    products.push(...variants);
  });

  return products;
};

const seed = async () => {
  await mongoose.connect(envConfig.mongoUri);
  console.log('✅ Connected to MongoDB');

  await ProductModel.deleteMany({});
  await CategoryModel.deleteMany({});
  await UserModel.deleteMany({});
  await CouponModel.deleteMany({});

  const categoryDocs = await CategoryModel.insertMany(categoriesSeed.map((category) => ({ ...category })));
  const categoryIdBySlug = new Map(categoryDocs.map((category) => [category.slug, category._id]));

  const products = generateProducts(categoryIdBySlug);
  await ProductModel.insertMany(products);
  console.log(`✅ Inserted ${products.length} products`);

  await CouponModel.insertMany(couponSeed);
  console.log(`✅ Inserted ${couponSeed.length} coupons`);

  const adminEmail = envConfig.admin.email ?? 'admin@quickcart.com';
  const adminPassword = envConfig.admin.password ?? 'QuickCart@123';
  const adminName = envConfig.admin.name ?? 'QuickCart Admin';
  const adminPhone = envConfig.admin.phone ?? '9999999999';

  const defaultUserPassword = await bcrypt.hash('QuickCart@123', 10);
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

  await UserModel.insertMany([
    {
      name: adminName,
      email: adminEmail,
      password: hashedAdminPassword,
      phone: adminPhone,
      role: 'admin',
      isVerified: true,
      addresses: [],
    },
    {
      name: 'QuickCart User',
      email: 'user@quickcart.com',
      password: defaultUserPassword,
      phone: '8888888888',
      role: 'user',
      isVerified: true,
      addresses: [],
    },
  ]);

  console.log('✅ Seeded users');
};

seed()
  .then(() => {
    console.log('🌱 Database seeding completed successfully');
    mongoose.connection.close();
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    mongoose.connection.close();
    process.exit(1);
  });

