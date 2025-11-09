import { Types } from 'mongoose';

export type ImageAsset = {
  publicId: string;
  url: string;
};

export type Dimensions = {
  length: number;
  width: number;
  height: number;
};

export type AddressType = 'home' | 'office' | 'other';

export type Address = {
  _id?: Types.ObjectId;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault?: boolean;
  addressType?: AddressType;
};

export type StatusHistoryEntry = {
  status: string;
  date: Date;
  note?: string;
};

