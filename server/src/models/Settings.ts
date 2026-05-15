import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  siteName: string;
  supportEmail: string;
  currency: string;
  razorpayKeyId?: string;
  maintenanceMode: boolean;
  announcement?: string;
  updatedAt: Date;
}

const SettingsSchema: Schema = new Schema({
  siteName: { type: String, default: 'TradingSkill' },
  supportEmail: { type: String, default: 'support@tradingskill.com' },
  currency: { type: String, default: 'USD' },
  razorpayKeyId: { type: String },
  maintenanceMode: { type: Boolean, default: false },
  announcement: { type: String },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<ISettings>('Settings', SettingsSchema);
