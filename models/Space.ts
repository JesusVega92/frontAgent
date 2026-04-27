import mongoose from 'mongoose';

export interface ISpace extends mongoose.Document {
  title: string;
  description: string;
  isOccupied: boolean;
  occupiedBy: mongoose.Types.ObjectId | null;
  occupiedByName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const spaceSchema = new mongoose.Schema<ISpace>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    isOccupied: {
      type: Boolean,
      default: false,
    },
    occupiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    occupiedByName: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Space = mongoose.models.Space || mongoose.model<ISpace>('Space', spaceSchema);