import mongoose, { Document, Schema, Model } from 'mongoose';

export type OrderStatus = 'Order Placed' | 'Processing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface IOrderItem {
  productId?: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  image?: string;
}

export interface IOrderStatusHistory {
  status: OrderStatus;
  timestamp: Date;
  note?: string;
}

export interface IDeliveryLocation {
  lat: number;
  lng: number;
  heading?: number;
  speed?: number; // km/h
  lastUpdated?: Date;
  statusText?: string;
  batteryLevel?: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  userId?: mongoose.Types.ObjectId;
  userName: string;
  userPhone: string;
  userEmail?: string;
  shopId?: mongoose.Types.ObjectId;
  shopName: string;
  shopLocation?: { lat: number; lng: number };
  deliveryAddress: string;
  destinationLocation?: { lat: number; lng: number };
  items: IOrderItem[];
  prescriptionImageUrl?: string;
  subtotal: number;
  deliveryFee: number;
  donationGstFee: number;
  taxAmount?: number;
  charityAmount?: number;
  couponCode?: string;
  discount: number;
  grandTotal: number;
  paymentMethod: 'Debit Card' | 'Credit Card' | 'Wallet' | 'Pay-on-Delivery (COD)';
  walletProvider?: string;
  isPaid: boolean;
  deliveryOtp?: string;
  paymentDetails?: {
    method: 'UPI_QR' | 'CASH' | 'ONLINE_PREPAID' | 'PAYMENT_LINK';
    collectedAt?: Date;
    amountCollected: number;
    cashTendered?: number;
    changeReturned?: number;
    upiTransactionRef?: string;
    payerVpa?: string;
    deliveryOtpVerified?: boolean;
    collectedBy?: string;
    note?: string;
  };
  status: OrderStatus;
  deliveryPersonnel: string;
  deliveryLocation?: IDeliveryLocation;
  statusHistory: IOrderStatusHistory[];
  estimatedDeliveryTimeMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userPhone: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
    },
    shopId: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
    },
    shopName: {
      type: String,
      required: true,
    },
    deliveryAddress: {
      type: String,
      required: true,
    },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product' },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, default: 1 },
        unit: { type: String, default: 'piece' },
        image: { type: String },
      },
    ],
    prescriptionImageUrl: {
      type: String,
    },
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    deliveryFee: {
      type: Number,
      required: true,
      default: 30,
    },
    donationGstFee: {
      type: Number,
      required: true,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    charityAmount: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      default: '',
    },
    discount: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['Debit Card', 'Credit Card', 'Wallet', 'Pay-on-Delivery (COD)'],
      default: 'Pay-on-Delivery (COD)',
    },
    walletProvider: {
      type: String,
      default: '',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    deliveryOtp: {
      type: String,
      default: () => Math.floor(1000 + Math.random() * 9000).toString(),
    },
    paymentDetails: {
      method: {
        type: String,
        enum: ['UPI_QR', 'CASH', 'ONLINE_PREPAID', 'PAYMENT_LINK'],
      },
      collectedAt: { type: Date },
      amountCollected: { type: Number },
      cashTendered: { type: Number },
      changeReturned: { type: Number },
      upiTransactionRef: { type: String },
      payerVpa: { type: String },
      deliveryOtpVerified: { type: Boolean, default: false },
      collectedBy: { type: String },
      note: { type: String },
    },
    status: {
      type: String,
      enum: ['Order Placed', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Order Placed',
      index: true,
    },
    deliveryPersonnel: {
      type: String,
      default: 'Anil Kumar (Delivery Partner)',
    },
    deliveryLocation: {
      lat: { type: Number, default: 24.5373 },
      lng: { type: Number, default: 81.3042 },
      heading: { type: Number, default: 0 },
      speed: { type: Number, default: 22 },
      lastUpdated: { type: Date, default: Date.now },
      statusText: { type: String, default: 'Rider assigned' },
      batteryLevel: { type: Number, default: 88 },
    },
    shopLocation: {
      lat: { type: Number, default: 24.5362 },
      lng: { type: Number, default: 81.3037 },
    },
    destinationLocation: {
      lat: { type: Number, default: 24.5420 },
      lng: { type: Number, default: 81.2965 },
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
    estimatedDeliveryTimeMinutes: {
      type: Number,
      default: 30,
    },
  },
  {
    timestamps: true,
  }
);

export const Order: Model<IOrder> = mongoose.model<IOrder>('Order', OrderSchema);

