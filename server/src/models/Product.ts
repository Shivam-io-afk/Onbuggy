import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IProduct extends Document {
  shopId: mongoose.Types.ObjectId;
  name: string;
  category: 'medicine' | 'grocery' | 'vegetable';
  price: number;
  originalPrice?: number;
  unit: string;
  image: string;
  description?: string;
  inStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    shopId: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['medicine', 'grocery', 'vegetable'],
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    unit: {
      type: String,
      default: 'piece',
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Product: Model<IProduct> = mongoose.model<IProduct>('Product', ProductSchema);

