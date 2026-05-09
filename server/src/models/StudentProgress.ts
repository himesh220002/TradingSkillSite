import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentProgress extends Document {
  userId: mongoose.Types.ObjectId;
  batchId: mongoose.Types.ObjectId;
  completedTopics: string[]; // Array of topicIds
  lastUpdated: Date;
}

const StudentProgressSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
  completedTopics: [{ type: String }],
  lastUpdated: { type: Date, default: Date.now },
});

// Ensure unique combination of userId and batchId
StudentProgressSchema.index({ userId: 1, batchId: 1 }, { unique: true });

export default mongoose.model<IStudentProgress>('StudentProgress', StudentProgressSchema);
