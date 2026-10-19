import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IShop extends Document {
  name: string;
  category: 'medicine' | 'grocery' | 'vegetable';
  categoryLabel: string;
  rating: number;
  reviewCount: number;
  deliveryTimeMin: number;
  distanceKm: number;
  isOpen: boolean;
  description: string;
  image: string;
  address: string;
  phone: string;
  lat?: number;
  lng?: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ShopSchema = new Schema<IShop>(
  {
    name: {
      type: String,
      required: [true, 'Shop name is required'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['medicine', 'grocery', 'vegetable'],
      required: true,
      index: true,
    },
    categoryLabel: {
      type: String,
      default: 'Essential Goods',
    },
    rating: {
      type: Number,
      default: 4.0,
      min: 1,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    deliveryTimeMin: {
      type: Number,
      default: 25,
    },
    distanceKm: {
      type: Number,
      default: 1.5,
    },
    isOpen: {
      type: Boolean,
      default: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: 'resorces/other/frontImage/8626119.png',
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: '+91 9876543210',
    },
    lat: {
      type: Number,
      default: 24.5373,
    },
    lng: {
      type: Number,
      default: 81.3042,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Shop: Model<IShop> = mongoose.model<IShop>('Shop', ShopSchema);

