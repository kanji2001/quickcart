export type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: {
    publicId?: string;
    url?: string;
  } | null;
  parentCategory?: string | Category | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

