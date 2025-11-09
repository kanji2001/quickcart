import { Document, Model } from 'mongoose';
import { Address, ImageAsset } from './common';

export type UserRole = 'user' | 'admin';

export interface User {
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

export interface UserDocument extends User, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateRefreshToken(): string;
}

export type UserModel = Model<UserDocument>;

