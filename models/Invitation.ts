import mongoose from 'mongoose';
import crypto from 'crypto';

export interface IInvitation extends mongoose.Document {
  email: string;
  role: 'user' | 'admin';
  token: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface InvitationModel extends mongoose.Model<IInvitation> {
  generateToken(): string;
  isValidToken(token: string): Promise<boolean>;
}

const invitationSchema = new mongoose.Schema<IInvitation>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

invitationSchema.statics.generateToken = function () {
  return crypto.randomBytes(32).toString('hex');
};

invitationSchema.statics.isValidToken = async function (token: string) {
  const invitation = await this.findOne({ token });
  if (!invitation) return false;
  if (invitation.usedAt) return false;
  if (invitation.expiresAt < new Date()) return false;
  return true;
};

export const Invitation = mongoose.models.Invitation || mongoose.model<IInvitation, InvitationModel>('Invitation', invitationSchema);