import mongoose, { Schema, Document } from 'mongoose';

export interface ICommunityMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  username: string;
  batchId?: mongoose.Types.ObjectId; // If null, it's a global message
  content: string;
  type: 'General' | 'Question' | 'TradeSetup';
  upvotes: string[]; // Array of user IDs who upvoted
  trainerResponse?: string;
  isResponded?: boolean;
  createdAt: Date;
  expiresAt: Date;
}

const CommunityMessageSchema: Schema = new Schema({
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  batchId: { type: Schema.Types.ObjectId, ref: 'Batch', default: null },
  content: { type: String, required: true },
  type: { type: String, enum: ['General', 'Question', 'TradeSetup'], default: 'General' },
  upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  trainerResponse: { type: String },
  isResponded: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { 
    type: Date, 
    default: () => new Date(+new Date() + 48 * 60 * 60 * 1000), // 48 hours from now
    index: { expires: 0 } // MongoDB TTL index to auto-delete
  }
}, { timestamps: true });

export default mongoose.model<ICommunityMessage>('CommunityMessage', CommunityMessageSchema);
