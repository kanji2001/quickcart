import { HydratedDocument, Model, Types } from 'mongoose';
import { Address, ImageAsset } from './common';

export type UserRole = 'user' | 'admin';

export interface User {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  avatar?: ImageAsset | null;
  addresses: Address[];
  isVerified: boolean;
  verificationToken?: string | null;
  resetPasswordToken?: string | null;
  resetPasswordExpire?: Date | null;
  refreshToken?: string | null;
  isBlocked: boolean;
}

export interface UserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateRefreshToken(): string;
}

export type UserDocument = HydratedDocument<User, UserMethods>;

export type UserModelType = Model<User, {}, UserMethods>;

