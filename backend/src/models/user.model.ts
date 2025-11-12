import bcrypt from 'bcrypt';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import mongoose, { Schema } from 'mongoose';
import { envConfig } from '../config/env';
import type { Address } from '../types/common';
import type { User, UserDocument, UserMethods, UserModelType } from '../types/user';

const addressSchema = new Schema<Address>(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: 'India' },
    isDefault: { type: Boolean, default: false },
    addressType: { type: String, enum: ['home', 'office', 'other'], default: 'home' },
  },
  { _id: true },
);

const userSchema = new Schema<User, UserModelType, UserMethods>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
    },
    password: { type: String, required: true, minlength: 8 },
    phone: { type: String, required: true, trim: true, match: [/^\d{10}$/, 'Phone must be 10 digits'] },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatar: {
      publicId: { type: String },
      url: { type: String },
    },
    addresses: { type: [addressSchema], default: [] },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    refreshToken: { type: String },
    isBlocked: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: Record<string, unknown>) => {
        delete ret.password;
        delete ret.__v;
        delete ret.refreshToken;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpire;
        delete ret.verificationToken;
        return ret;
      },
    },
  },
);

userSchema.pre<UserDocument>('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function generateAuthToken() {
  return jwt.sign(
    {
      sub: this._id.toString(),
      role: this.role,
    },
    envConfig.jwt.accessSecret as Secret,
    { expiresIn: envConfig.jwt.accessExpire as SignOptions['expiresIn'] },
  );
};

userSchema.methods.generateRefreshToken = function generateRefreshToken() {
  const token = jwt.sign(
    {
      sub: this._id.toString(),
      role: this.role,
      tokenType: 'refresh',
    },
    envConfig.jwt.refreshSecret as Secret,
    { expiresIn: envConfig.jwt.refreshExpire as SignOptions['expiresIn'] },
  );

  this.refreshToken = token;
  return token;
};

export const UserModel =
  (mongoose.models.User as UserModelType) || mongoose.model<User, UserModelType>('User', userSchema);

