import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IContactMessage extends Document {
  name: string;
  email: string;
  topic: string;
  message: string;
  status: 'pending' | 'resolved';
  createdAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    topic: {
      type: String,
      required: true,
      default: 'General Inquiry',
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'resolved'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export const ContactMessage: Model<IContactMessage> = mongoose.model<IContactMessage>(
  'ContactMessage',
  ContactMessageSchema
);

