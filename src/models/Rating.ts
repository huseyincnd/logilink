import mongoose from 'mongoose';

export interface IRating {
  ilanId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

const ratingSchema = new mongoose.Schema<IRating>({
  ilanId: {
    type: String,
    required: true,
    ref: 'Listing'
  },
  fromUserId: {
    type: String,
    required: true,
    ref: 'User'
  },
  toUserId: {
    type: String,
    required: true,
    ref: 'User'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  }
});

// Aynı kullanıcının aynı ilan için birden fazla değerlendirme yapmasını engelle
ratingSchema.index({ ilanId: 1, fromUserId: 1 }, { unique: true });

export default mongoose.models.Rating || mongoose.model<IRating>('Rating', ratingSchema); 