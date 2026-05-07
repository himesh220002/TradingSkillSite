import mongoose, { Schema, Document } from 'mongoose';

export interface IBatchTopic {
  topicId: string;
  name: string;
  isCompleted: boolean;
  completionDate?: Date | null;
}

export interface IBatch extends Document {
  courseId: mongoose.Types.ObjectId;
  batchName: string; // e.g., "Jan 2026 Batch A"
  studentCount: number;
  startDate: Date;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'On Hold';
  trainer: string;
  meetingLink: string;
  practicalCount: number;
  testsConducted: number;
  assignmentsDue: number;
  topicProgress: IBatchTopic[];
  progressPercentage: number;
  sharedLinks: { title: string; url: string; category?: string }[];
  resources: { title: string; type: 'pdf' | 'doc' | 'link'; url: string }[];
  internalNotes: string;
  createdAt: Date;
}

const BatchSchema: Schema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  batchName: { type: String, required: true },
  studentCount: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed', 'On Hold'],
    default: 'Upcoming'
  },
  trainer: { type: String, default: 'Krishna Sharma' },
  meetingLink: { type: String },
  practicalCount: { type: Number, default: 0 },
  testsConducted: { type: Number, default: 0 },
  assignmentsDue: { type: Number, default: 0 },
  topicProgress: [{
    topicId: { type: String, required: true },
    name: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    completionDate: { type: Date, default: null }
  }],
  progressPercentage: { type: Number, default: 0 },
  sharedLinks: [{
    title: { type: String, required: true },
    url: { type: String, required: true },
    category: { type: String }
  }],
  resources: [{
    title: { type: String, required: true },
    type: { type: String, enum: ['pdf', 'doc', 'link'], default: 'link' },
    url: { type: String, required: true }
  }],
  internalNotes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Middleware to calculate progressPercentage before saving
BatchSchema.pre<IBatch>('save', async function () {
  if (this.topicProgress && this.topicProgress.length > 0) {
    const completedCount = this.topicProgress.filter((tp: any) => tp.isCompleted).length;
    this.progressPercentage = Math.round((completedCount / this.topicProgress.length) * 100);
  } else {
    this.progressPercentage = 0;
  }
});

export default mongoose.model<IBatch>('Batch', BatchSchema);
