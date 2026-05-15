import mongoose, { Schema, Document } from 'mongoose';

export interface IBatchTopic {
  topicId: string;
  name: string;
  sectionName?: string;
  isCompleted: boolean;
  completionDate?: Date | null;
}

export interface IBatch extends Document {
  courseId: mongoose.Types.ObjectId;
  batchName: string; // e.g., "Jan 2026 Batch A"
  studentCount: number;
  students: mongoose.Types.ObjectId[];
  startDate: Date;
  maxStudents: number;
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
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'On Hold';
  generalSchedule: {
    dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    startTime: string;
    endTime: string;
    type: 'Class' | 'Off';
  }[];
  schedule: {
    date: Date;
    startTime?: string;
    endTime?: string;
    type: 'Class' | 'Off' | 'Event';
    note?: string;
  }[];
  createdAt: Date;
}

const BatchSchema: Schema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  batchName: { type: String, required: true },
  studentCount: { type: Number, default: 0 },
  students: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  startDate: { type: Date, required: true },
  maxStudents: { type: Number, default: 50 },
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
    sectionName: { type: String },
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
  generalSchedule: [{
    dayOfWeek: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    type: { type: String, enum: ['Class', 'Off'], default: 'Class' }
  }],
  schedule: [{
    date: { type: Date, required: true },
    startTime: { type: String },
    endTime: { type: String },
    type: { type: String, enum: ['Class', 'Off', 'Event'], default: 'Class' },
    note: { type: String }
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
