import mongoose, { Schema, Document } from 'mongoose';

import bcrypt from 'bcrypt';

export interface IUser extends Document {
  username: string;
  password: string;
  role: 'student' | 'admin';
  enrolledBatches: mongoose.Types.ObjectId[];
  dailyGlobalChats: number;
  dailyBatchQuestions: number;
  lastLimitResetDate: Date;
  createdAt: Date;
}


const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  name: { type: String },
  phone: { type: String },
  linkedin: { type: String },
  github: { type: String },
  avatar: { type: String },
  enrolledBatches: [{ type: Schema.Types.ObjectId, ref: 'Batch' }],
  dailyGlobalChats: { type: Number, default: 0 },
  dailyBatchQuestions: { type: Number, default: 0 },
  lastLimitResetDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
UserSchema.pre<IUser>('save', async function() {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

export default mongoose.model<IUser>('User', UserSchema);
