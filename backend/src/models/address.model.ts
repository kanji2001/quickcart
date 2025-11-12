import mongoose, { Schema, Types } from 'mongoose';
import type { Address } from '../types/common';

interface AddressEntity extends Address {
  user: Types.ObjectId;
}

type AddressDocument = mongoose.HydratedDocument<AddressEntity>;

type AddressModelType = mongoose.Model<AddressEntity>;

const addressSchema = new Schema<AddressEntity, AddressModelType>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    country: { type: String, default: 'India', trim: true },
    isDefault: { type: Boolean, default: false },
    addressType: { type: String, enum: ['home', 'office', 'other'], default: 'home' },
  },
  { timestamps: true },
);

addressSchema.index({ user: 1, isDefault: 1 });

export const AddressModel =
  (mongoose.models.Address as AddressModelType) || mongoose.model<AddressEntity, AddressModelType>('Address', addressSchema);

